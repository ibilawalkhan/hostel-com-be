import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SigninDto, CustomerSignupDto, OwnerSignupDto, WardenFirstTimeLoginDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
@Public() // All auth routes (signin, signup, warden) do not require JWT
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup/customer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiResponse({ status: 201, description: 'Customer registered successfully' })
  @ApiResponse({ status: 409, description: 'Phone number already registered' })
  async customerSignup(@Body() signupDto: CustomerSignupDto) {
    return this.authService.customerSignup(signupDto);
  }

  @Post('signup/owner')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new hostel owner account' })
  @ApiResponse({ status: 201, description: 'Owner registered successfully' })
  @ApiResponse({ status: 409, description: 'Phone number already registered' })
  async ownerSignup(@Body() signupDto: OwnerSignupDto) {
    return this.authService.ownerSignup(signupDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with phone number and password' })
  @ApiResponse({ status: 200, description: 'Returns JWT access token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Post('warden/first-time-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Warden sets password and uploads documents on first login' })
  @ApiResponse({ status: 200, description: 'Warden account activated, returns JWT' })
  async wardenFirstTimeLogin(@Body() wardenLoginDto: WardenFirstTimeLoginDto) {
    return this.authService.wardenFirstTimeLogin(wardenLoginDto);
  }
}
