import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FilterPaymentsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by payer user kuid' })
  @IsOptional()
  @IsString()
  user_kuid?: string;

  @ApiPropertyOptional({ description: 'Filter by hostel kuid' })
  @IsOptional()
  @IsString()
  hostel_kuid?: string;

  @ApiPropertyOptional({ description: 'Filter by room kuid' })
  @IsOptional()
  @IsString()
  room_kuid?: string;

  @ApiPropertyOptional({ description: 'Filter by bed kuid' })
  @IsOptional()
  @IsString()
  bed_kuid?: string;

  @ApiPropertyOptional({ description: 'Filter by payment type kuid' })
  @IsOptional()
  @IsString()
  payment_type_kuid?: string;

  @ApiPropertyOptional({ description: 'Filter by payment account kuid' })
  @IsOptional()
  @IsString()
  payment_account_kuid?: string;

  @ApiPropertyOptional({ description: 'Filter by payment method', example: 'BANK_TRANSFER' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    description: 'Filter by payment status',
  })
  @IsOptional()
  @IsIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'])
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

  @ApiPropertyOptional({
    enum: ['UNDER-REVIEW', 'APPROVED', 'REJECTED'],
    description: 'Filter by verification status',
  })
  @IsOptional()
  @IsIn(['UNDER-REVIEW', 'APPROVED', 'REJECTED'])
  verification_status?: 'UNDER-REVIEW' | 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ description: 'Filter by minimum amount', example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_amount?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum amount', example: 50000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_amount?: number;
}
