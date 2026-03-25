export interface PaymentRow {
  kuid: string;
  user_kuid: string;
  payment_type_kuid: string;
  payment_account_kuid: string;
  hostel_kuid: string;
  room_kuid: string;
  bed_kuid: string;
  payment_method: string;
  amount: number;
  payment_attachment_url: string;
  txn_reference: string;
  status: string;
  reviewed_by_user_kuid: string;
  reviewed_at: Date;
  verification_status: string;
  rejection_reason: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentInput {
  user_kuid: string;
  payment_type_kuid: string;
  payment_account_kuid: string;
  hostel_kuid: string;
  room_kuid: string;
  bed_kuid: string;
  amount: number;
  payment_method?: string;
  payment_attachment_url?: string;
  txn_reference?: string;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  verification_status?: 'UNDER-REVIEW' | 'APPROVED' | 'REJECTED';
}

export interface PaymentFilters {
  user_kuid?: string;
  hostel_kuid?: string;
  room_kuid?: string;
  bed_kuid?: string;
  payment_type_kuid?: string;
  payment_account_kuid?: string;
  payment_method?: string;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  verification_status?: 'UNDER-REVIEW' | 'APPROVED' | 'REJECTED';
  min_amount?: number;
  max_amount?: number;
}

export interface UpdatePaymentReviewInput {
  verification_status: 'APPROVED' | 'REJECTED';
  reviewed_by_user_kuid: string;
  reviewed_at: Date;
  rejection_reason: string | null;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export interface PaymentAccountRow {
  kuid: string;
  hostel_kuid: string;
  account_type_kuid: string;
  account_title: string;
  account_number: string;
  bank_name: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentAccountInput {
  hostel_kuid: string;
  account_type_kuid: string;
  account_title: string;
  account_number: string;
  bank_name?: string;
}

export interface PaymentStats {
  total_revenue: number;
  pending_amount: number;
  overdue_amount: number;
  successful_payments: number;
}