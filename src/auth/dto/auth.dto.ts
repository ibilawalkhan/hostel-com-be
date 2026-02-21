import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  Matches,
  ValidateIf,
  IsArray,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';

// Base signup DTO with common fields
export class BaseSignupDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  full_name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Please provide a valid phone number' })
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

// Customer signup DTO - only requires basic fields
export class CustomerSignupDto extends BaseSignupDto {
  // Customer only needs: full_name, phone_number, password
}

// Owner signup DTO - requires all fields including CNIC
export class OwnerSignupDto extends BaseSignupDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email_address?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, { 
    message: 'CNIC number must be in format: XXXXX-XXXXXXX-X' 
  })
  cnic_number: string;

  @IsNotEmpty()
  @IsString()
  cnic_front: string;

  @IsNotEmpty()
  @IsString()
  cnic_back: string;
}

// Union type for signup DTOs
export type SignupDto = CustomerSignupDto | OwnerSignupDto;

export class SigninDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Please provide a valid phone number' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

export class WardenFirstTimeLoginDto {
  @IsNotEmpty()
  @IsString()
  user_kuid: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  cnic_front: string; // URL

  @IsNotEmpty()
  @IsString()
  cnic_back: string; // URL

  @IsNotEmpty()
  @IsString()
  selfie: string; // URL
}

export class AddNewWardenDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  full_name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Please provide a valid phone number' })
  phone_number: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsNotEmpty()
  @IsString()
  assigned_hostel: string; // hostel_kuid

  @IsOptional()
  @IsString()
  assigned_branch?: string; // branch_kuid (optional)

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one permission is required' })
  @IsString({ each: true })
  permission_kuids: string[];
}
