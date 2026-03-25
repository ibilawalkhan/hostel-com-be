import { Injectable, NotFoundException } from "@nestjs/common";
import {
  PaymentAccountRow,
  PaymentFilters,
  PaymentRow,
  PaymentStats,
} from "./interface/payments.interface";
import { PaymentsRepository } from "./repository/payments.repository";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentReviewDto } from "./dto/update-payment-review.dto";
import { AddPaymentAccountDto } from "./dto/add-payment-account.dto";

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async getPaymentStats(): Promise<PaymentStats> {
    return this.paymentsRepository.getPaymentStats();
  }

  async addPaymentAccount(
    dto: AddPaymentAccountDto,
  ): Promise<{ message: string; payment_account: PaymentAccountRow }> {
    const payment_account = await this.paymentsRepository.createPaymentAccount(dto);
    return {
      message: 'Payment account added successfully',
      payment_account,
    };
  }

  async createPayment(dto: CreatePaymentDto): Promise<{ message: string; payment: PaymentRow }> {
    const payment = await this.paymentsRepository.createPayment(dto);
    return {
      message: 'Payment created successfully',
      payment,
    };
  }

  async findAllPayments(): Promise<{ message: string, payments: PaymentRow[] }> {
    const payments = await this.paymentsRepository.findAllPayments();
    return {
      message: 'Payments fetched successfully',
      payments,
    };
  }

  async findPaymentsWithFilters(filters: PaymentFilters): Promise<{ message: string; payments: PaymentRow[] }> {
    const hasFilters = Object.values(filters).some((value) => value !== undefined && value !== null && value !== '');
    if (!hasFilters) {
      return this.findAllPayments();
    }

    const payments = await this.paymentsRepository.findPaymentsWithFilters(filters);
    return {
      message: 'Payments fetched successfully',
      payments,
    };
  }

  async reviewPayment(
    paymentKuid: string,
    dto: UpdatePaymentReviewDto,
    reviewerKuid: string,
  ): Promise<{ message: string; payment: PaymentRow }> {
    const existing = await this.paymentsRepository.findByKuid(paymentKuid);
    if (!existing) {
      throw new NotFoundException('Payment not found');
    }

    const status =
      dto.status ??
      (dto.verification_status === 'APPROVED' ? 'COMPLETED' : 'FAILED');

    const payment = await this.paymentsRepository.updatePaymentReview(paymentKuid, {
      verification_status: dto.verification_status,
      reviewed_by_user_kuid: reviewerKuid,
      reviewed_at: new Date(),
      rejection_reason:
        dto.verification_status === 'REJECTED'
          ? dto.rejection_reason!.trim()
          : null,
      status,
    });

    return {
      message: 'Payment review updated successfully',
      payment,
    };
  }
}