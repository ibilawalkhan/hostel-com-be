import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdatePaymentReviewDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  verification_status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'] })
  @IsOptional()
  @IsIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'])
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

  @ApiPropertyOptional({ description: 'Required when verification_status is REJECTED' })
  @ValidateIf((o: UpdatePaymentReviewDto) => o.verification_status === 'REJECTED')
  @IsString()
  @IsNotEmpty()
  rejection_reason?: string;
}
