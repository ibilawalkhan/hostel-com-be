import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HostelService } from './hostel.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { TokenPayload } from '../common/services/token.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Hostel')
@ApiBearerAuth('JWT')
@Controller('hostel')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: add a new hostel' })
  @ApiResponse({ status: 201, description: 'Hostel created successfully' })
  @ApiResponse({ status: 403, description: 'Only OWNER or WARDEN can perform this action' })
  create(
    @Body() createHostelDto: CreateHostelDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.hostelService.create(createHostelDto, user.sub);
  }

  @Get()
  findAll() {
    return this.hostelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hostelService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: edit an existing hostel' })
  @ApiResponse({ status: 200, description: 'Hostel updated successfully' })
  @ApiResponse({ status: 404, description: 'Hostel not found' })
  @ApiResponse({ status: 403, description: 'Only OWNER or WARDEN can perform this action' })
  update(
    @Param('id') id: string,
    @Body() updateHostelDto: UpdateHostelDto,
  ) {
    return this.hostelService.update(id, updateHostelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hostelService.remove(+id);
  }
}
