import { Injectable, BadRequestException } from '@nestjs/common';
import { SigninDto, CustomerSignupDto, OwnerSignupDto, WardenFirstTimeLoginDto } from './dto/auth.dto';
import {
  InvalidCredentialsException,
} from '../common/exceptions/auth.exceptions';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { PasswordService } from '../common/services/password.service';
import { TokenService } from '../common/services/token.service';
import { LoggerService } from '../common/services/logger.service';
import { TransactionHelper } from '../common/database/transaction.helper';
import { AuthSuccessMessages } from '../common/constants/error-messages';
import { validateUserUniqueness } from './helper/validation.helper';
import { handleSignupError } from './helper/error.helper';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private logger: LoggerService,
    private transactionHelper: TransactionHelper,
  ) { }


  /**
   * Customer signup - requires only basic fields
   */
  async customerSignup(data: CustomerSignupDto) {
    const { full_name, phone_number, password } = data;

    // Validate user doesn't already exist
    await validateUserUniqueness(
      this.userRepository,
      this.logger,
      phone_number,
      null,
      null
    );

    const passwordHash = await this.passwordService.hash(password);

    try {
      const result = await this.transactionHelper.executeInTransaction(
        async (client) => {
          // Create user without CNIC fields
          const newUser = await this.userRepository.create(
            client,
            full_name,
            phone_number,
            null, // email
            passwordHash,
          );

          // Create CUSTOMER role
          const role = await this.roleRepository.create(
            client,
            newUser.kuid,
            'CUSTOMER',
          );

          return { user: newUser, role };
        },
      );

      this.logger.log(
        `Customer registered successfully: ${result.user.kuid}`,
        'AuthService',
      );

      const tokens = await this.tokenService.generateTokens(result.user, {
        name: result.role.name,
        kuid: result.role.kuid,
      });

      return {
        message: AuthSuccessMessages.SIGNUP_SUCCESS,
        user: {
          kuid: result.user.kuid,
          full_name: result.user.full_name,
          phone: result.user.phone,
          role: result.role.name,
        },
        ...tokens,
      };
    } catch (error) {
      handleSignupError(error, phone_number, this.logger);
    }
  }


  /**
   * Owner signup - requires all fields including CNIC
   */
  async ownerSignup(data: OwnerSignupDto) {
    const {
      full_name,
      phone_number,
      email_address,
      password,
      cnic_number,
      cnic_front,
      cnic_back,
    } = data;

    // Validate user doesn't already exist
    await validateUserUniqueness(
      this.userRepository,
      this.logger,
      phone_number,
      email_address,
      cnic_number,
    );

    const passwordHash = await this.passwordService.hash(password);

    try {
      const result = await this.transactionHelper.executeInTransaction(
        async (client) => {
          // Create user with CNIC fields
          const newUser = await this.userRepository.create(
            client,
            full_name,
            phone_number,
            email_address || null,
            passwordHash,
            cnic_number,
            cnic_front,
            cnic_back,
          );

          // Create OWNER role
          const role = await this.roleRepository.create(
            client,
            newUser.kuid,
            'OWNER',
          );

          return { user: newUser, role };
        },
      );

      this.logger.log(
        `Owner registered successfully: ${result.user.kuid}`,
        'AuthService',
      );

      const tokens = await this.tokenService.generateTokens(result.user, {
        name: result.role.name,
        kuid: result.role.kuid,
      });

      return {
        message: AuthSuccessMessages.SIGNUP_SUCCESS,
        user: {
          kuid: result.user.kuid,
          full_name: result.user.full_name,
          phone: result.user.phone,
          email: result.user.email,
          cnic_number: result.user.cnic_number,
          role: result.role.name,
        },
        ...tokens,
      };
    } catch (error) {
      handleSignupError(error, phone_number, this.logger);
    }
  }


  /**
   * Unified signin - supports phone login for all roles
   */
  async signin(data: SigninDto) {
    const { phone, password } = data;

    // Find user by phone
    const user = await this.userRepository.findByPhoneWithPassword(phone);

    const hashToCompare = user?.password || this.passwordService.getFakeHash();
    const isPasswordValid = await this.passwordService.compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      this.logger.warn(`Failed signin attempt for phone: ${phone}`, 'AuthService');
      throw new InvalidCredentialsException();
    }

    // Get user roles
    const roles = await this.roleRepository.findByUserKuid(user.kuid);
    if (!roles || roles.length === 0) {
      this.logger.warn(`User ${user.kuid} has no roles assigned`, 'AuthService');
      throw new InvalidCredentialsException();
    }

    // Get the primary role (most recent or active)
    const primaryRole = roles.find((r) => r.is_active) || roles[0];

    // Handle warden first-time login
    if (primaryRole.name === 'WARDEN') {
      const isFirstTime = !user.cnic_front || !user.cnic_back || !user.selfie;

      if (isFirstTime) {
        return {
          message: 'First time login - verification required',
          requires_verification: true,
          user: {
            kuid: user.kuid,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: primaryRole.name,
          },
          role: {
            kuid: primaryRole.kuid,
            name: primaryRole.name,
            assigned_hostel: primaryRole.assigned_hostel,
            assigned_branch: primaryRole.hostel_branch,
          },
        };
      }

      // Get warden permissions
      const permissions = await this.roleRepository.findPermissionsByRoleKuid(primaryRole.kuid);

      const tokens = await this.tokenService.generateTokens(user, {
        name: primaryRole.name,
        kuid: primaryRole.kuid,
      });

      this.logger.log(`Warden signed in successfully: ${user.kuid}`, 'AuthService');

      const { password: _, ...safeUser } = user;

      return {
        message: AuthSuccessMessages.SIGNIN_SUCCESS,
        user: safeUser,
        role: {
          kuid: primaryRole.kuid,
          name: primaryRole.name,
          assigned_hostel: primaryRole.assigned_hostel,
          assigned_branch: primaryRole.hostel_branch,
        },
        permissions: permissions.map((p) => ({
          kuid: p.kuid,
          permission_name: p.permission_name,
          description: p.description,
        })),
        ...tokens,
      };
    }

    // Handle customer and owner signin
    const tokens = await this.tokenService.generateTokens(user, {
      name: primaryRole.name,
      kuid: primaryRole.kuid,
    });

    this.logger.log(`User signed in successfully: ${user.kuid}`, 'AuthService');

    const { password: _, ...safeUser } = user;

    return {
      message: AuthSuccessMessages.SIGNIN_SUCCESS,
      user: safeUser,
      role: {
        kuid: primaryRole.kuid,
        name: primaryRole.name,
        assigned_hostel: primaryRole.assigned_hostel,
        assigned_branch: primaryRole.hostel_branch,
      },
      ...tokens,
    };
  }

  /**
   * Warden first-time login - uploads CNIC and selfie, then retrieves permissions
   */
  async wardenFirstTimeLogin(data: WardenFirstTimeLoginDto) {
    const { user_kuid, password, cnic_front, cnic_back, selfie } = data;

    // Verify password first
    const user = await this.userRepository.findByKuidWithPassword(user_kuid);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const hashToCompare = user.password || this.passwordService.getFakeHash();
    const isPasswordValid = await this.passwordService.compare(password, hashToCompare);

    if (!isPasswordValid) {
      this.logger.warn(`Failed warden first-time login attempt for user: ${user_kuid}`, 'AuthService');
      throw new InvalidCredentialsException();
    }

    // Get warden role
    const roles = await this.roleRepository.findByUserKuid(user_kuid);
    const wardenRole = roles.find((r) => r.name === 'WARDEN' && r.is_active);
    if (!wardenRole) {
      throw new InvalidCredentialsException();
    }

    try {
      const result = await this.transactionHelper.executeInTransaction(
        async (client) => {
          // Update warden verification documents
          const updatedUser = await this.userRepository.updateWardenVerification(
            client,
            user_kuid,
            cnic_front,
            cnic_back,
            selfie,
          );

          return { user: updatedUser, role: wardenRole };
        },
      );

      // Get permissions
      const permissions = await this.roleRepository.findPermissionsByRoleKuid(wardenRole.kuid);

      const tokens = await this.tokenService.generateTokens(result.user, {
        name: wardenRole.name,
        kuid: wardenRole.kuid,
      });

      this.logger.log(`Warden first-time login completed: ${result.user.kuid}`, 'AuthService');

      return {
        message: 'Warden verification completed successfully',
        user: {
          kuid: result.user.kuid,
          full_name: result.user.full_name,
          email: result.user.email,
          phone: result.user.phone,
          role: result.role.name,
        },
        role: {
          kuid: result.role.kuid,
          name: result.role.name,
          assigned_hostel: result.role.assigned_hostel,
          assigned_branch: result.role.hostel_branch,
        },
        permissions: permissions.map((p) => ({
          kuid: p.kuid,
          permission_name: p.permission_name,
          description: p.description,
        })),
        ...tokens,
      };
    } catch (error) {
      this.logger.error(`Warden first-time login failed: ${error.message}`, error.stack, 'AuthService');
      throw error;
    }
  }


}
