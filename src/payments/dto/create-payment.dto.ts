import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Payer user kuid' })
  @IsString()
  user_kuid: string;

  @ApiProperty({ description: 'Payment type kuid' })
  @IsString()
  payment_type_kuid: string;

  @ApiProperty({ description: 'Payment account kuid' })
  @IsString()
  payment_account_kuid: string;

  @ApiProperty({ description: 'Hostel kuid linked to payment' })
  @IsString()
  hostel_kuid: string;

  @ApiProperty({ description: 'Room kuid linked to payment' })
  @IsString()
  room_kuid: string;

  @ApiProperty({ description: 'Bed kuid linked to payment' })
  @IsString()
  bed_kuid: string;

  @ApiProperty({ description: 'Payment amount', example: 25000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Payment method (e.g. BANK_TRANSFER, CASH, UPI)' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Attachment proof URL' })
  @IsOptional()
  @IsString()
  payment_attachment_url?: string;

  @ApiPropertyOptional({ description: 'Transaction reference (must be unique if provided)' })
  @IsOptional()
  @IsString()
  txn_reference?: string;

  @ApiPropertyOptional({ enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'], default: 'PENDING' })
  @IsOptional()
  @IsIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'])
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

  @ApiPropertyOptional({ enum: ['UNDER-REVIEW', 'APPROVED', 'REJECTED'] })
  @IsOptional()
  @IsIn(['UNDER-REVIEW', 'APPROVED', 'REJECTED'])
  verification_status?: 'UNDER-REVIEW' | 'APPROVED' | 'REJECTED';
}
