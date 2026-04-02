import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddPaymentAccountDto {
  // @ApiPropertyOptional({ description: 'Hostel kuid for this payment account (optional)' })
  @IsOptional()
  @IsString()
  hostel_kuid?: string;

  // @ApiProperty({ description: 'Account type kuid' })
  @IsString()
  account_type_kuid: string;

  // @ApiProperty({ description: 'Account title / account holder name' })
  @IsString()
  account_title: string;

  // @ApiProperty({ description: 'Account number' })
  @IsString()
  account_number: string;

  // @ApiPropertyOptional({ description: 'Bank name (optional)' })
  @IsOptional()
  @IsString()
  bank_name?: string;
}
