import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LookupService } from './lookup.service';

@ApiTags('Lookup')
@ApiBearerAuth('JWT')
@Controller('lookup')
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}

  @Get('complaint-categories')
  @ApiOperation({ summary: 'Get all complaint categories' })
  @ApiResponse({ status: 200, description: 'List of complaint categories' })
  getComplaintCategories() {
    return this.lookupService.getComplaintCategories();
  }

  @Get('complaint-priorities')
  @ApiOperation({ summary: 'Get all complaint priority levels' })
  @ApiResponse({ status: 200, description: 'List of priority levels' })
  getComplaintPriorities() {
    return this.lookupService.getComplaintPriorities();
  }

  // @Get('permissions')
  // @ApiOperation({ summary: 'Get all available permissions' })
  // @ApiResponse({ status: 200, description: 'List of permissions' })
  // getPermissions() {
  //   return this.lookupService.getPermissions();
  // }
}
