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
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('add-account')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  addPaymentAccount(
    @Body() dto: AddPaymentAccountDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.paymentsService.addPaymentAccount(dto, user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  updatePaymentReview(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentReviewDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.paymentsService.reviewPayment(id, dto, user.sub);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAllPayments(@Query() query: FilterPaymentsQueryDto) {
    return this.paymentsService.findPaymentsWithFilters(query);
  }
}