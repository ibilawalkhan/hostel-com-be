import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LookupService } from './lookup.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { TokenPayload } from '../common/services/token.service';

@ApiTags('Lookup')
@ApiBearerAuth('JWT')
@Controller('lookup')
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}

  @Get('metadata')
  @ApiOperation({ summary: 'Get all application metadata for initialization' })
  @ApiResponse({
    status: 200,
    description:
      'All metadata including categories, priorities, facilities, payment types, account types, permissions, and (for owners) their hostels with branches',
  })
  getAllMetadata(@CurrentUser() payload: TokenPayload) {

    return this.lookupService.getAllMetadata(payload.sub);

  }
  
}
