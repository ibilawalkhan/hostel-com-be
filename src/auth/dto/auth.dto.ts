import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  Matches,
} from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
  //   message:
  //     'Password must contain uppercase, lowercase, number and special character',
  // })
  password: string;

  @IsNotEmpty()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsNotEmpty()
  terms_accepted: boolean;
}

export class SigninDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
