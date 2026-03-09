import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  Matches,
  IsArray,
  IsUUID,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Base signup DTO with common fields
export class BaseSignupDto {
  @ApiProperty({ example: 'Ali Hassan', description: 'Full name of the user' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Full name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z]+(?:[\s\-][a-zA-Z]+)+$/, {
    message: 'Please provide your full name with at least first and last name. Only letters, spaces, or hyphens are allowed.',
  })
  full_name: string;

  @ApiProperty({ example: '+92-300-1234567', description: 'Phone number (used as login identifier)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?:\+92|0)3\d{9}$/, { message: 'Please provide a valid phone number' })
  phone_number: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
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
  @ApiPropertyOptional({ example: 'owner@hostel.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email_address?: string;

  @ApiProperty({ example: '42201-1234567-1', description: 'CNIC in format XXXXX-XXXXXXX-X' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, {
    message: 'CNIC number must be in format: XXXXX-XXXXXXX-X'
  })
  cnic_number: string;

  @ApiProperty({ example: 'https://cdn.example.com/cnic-front.jpg', description: 'URL of CNIC front image' })
  @IsNotEmpty()
  @IsString()
  cnic_front: string;

  @ApiProperty({ example: 'https://cdn.example.com/cnic-back.jpg', description: 'URL of CNIC back image' })
  @IsNotEmpty()
  @IsString()
  cnic_back: string;
}

// Union type for signup DTOs
export type SignupDto = CustomerSignupDto | OwnerSignupDto;

export class SigninDto {
  @ApiProperty({ example: '+92-300-1234567' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Please provide a valid phone number' })
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

export class WardenFirstTimeLoginDto {
  @ApiProperty({ description: 'User kuid of the warden' })
  @IsNotEmpty()
  @IsString()
  user_kuid: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'https://cdn.example.com/cnic-front.jpg' })
  @IsNotEmpty()
  @IsString()
  cnic_front: string; // URL

  @ApiProperty({ example: 'https://cdn.example.com/cnic-back.jpg' })
  @IsNotEmpty()
  @IsString()
  cnic_back: string; // URL

  @ApiProperty({ example: 'https://cdn.example.com/selfie.jpg' })
  @IsNotEmpty()
  @IsString()
  selfie: string; // URL
}

export class AddNewWardenDto {
  @ApiProperty({ example: 'Sara Khan' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  full_name: string;

  @ApiProperty({ example: '+92-333-9876543' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Please provide a valid phone number' })
  phone_number: string;


  @ApiProperty({ description: 'hostel_kuid to assign the warden to' })
  @IsNotEmpty()
  @IsString()
  assigned_hostel: string; // hostel_kuid

  @ApiPropertyOptional({ description: 'branch_kuid (optional)' })
  @IsOptional()
  @IsString()
  assigned_branch?: string; // branch_kuid (optional)

  @ApiProperty({ type: [String], description: 'Array of permission kuids' })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one permission is required' })
  @IsString({ each: true })
  permission_kuids: string[];
}
