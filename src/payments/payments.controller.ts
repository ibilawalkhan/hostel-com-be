import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
// import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Get, Query } from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { FilterPaymentsQueryDto } from "./dto/filter-payments-query.dto";
import { UpdatePaymentReviewDto } from "./dto/update-payment-review.dto";
import { AddPaymentAccountDto } from "./dto/add-payment-account.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { TokenPayload } from "../common/services/token.service";

@Controller('payments')
// @ApiTags('Payments')
// @ApiBearerAuth('JWT')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('add-account')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  // @ApiOperation({ summary: 'Owner/Warden: add payment account' })
  // @ApiResponse({ status: 201, description: 'Payment account added successfully' })
  addPaymentAccount(
    @Body() dto: AddPaymentAccountDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.paymentsService.addPaymentAccount(dto, user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({ summary: 'Create payment' })
  // @ApiResponse({ status: 201, description: 'Payment created successfully' })
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  // @ApiOperation({ summary: 'Owner/Warden: review a payment as APPROVED or REJECTED' })
  // @ApiResponse({ status: 200, description: 'Payment review updated successfully' })
  // @ApiResponse({ status: 404, description: 'Payment not found' })
  updatePaymentReview(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentReviewDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.paymentsService.reviewPayment(id, dto, user.sub);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Get payment stats' })
  // @ApiResponse({
  //   status: 200,
  //   description:
  //     'Returns payment stats: total_revenue, pending_amount, overdue_amount, successful_payments',
  // })
  getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Get payments with optional filters' })
  // @ApiResponse({ status: 200, description: 'Returns payments list (filtered when query params are provided)' })
  findAllPayments(@Query() query: FilterPaymentsQueryDto) {
    return this.paymentsService.findPaymentsWithFilters(query);
  }
}