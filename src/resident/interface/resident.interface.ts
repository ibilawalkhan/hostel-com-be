export interface WalkInRow {
  kuid: string;
  hostel_kuid: string;
  branch_no: string;
  room_kuid: string;
  bed_kuid: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  cnic: string;
  emergency_contact_name: string;
  emergency_phone: string;
  room_type: string;
  check_in_date: Date;
  monthly_rent: number;
  security_deposit: number | null;
  ac_charges: number | null;
  payment_mode: string;
  transaction_id: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}
export interface ResidentRow {
  kuid: string;
  user_kuid: string;
  assigned_bed_kuid: string;
  type: string;
  emergency_contact_1: string;
  emergency_contact_2: string | null;
  is_active: boolean;
  check_in_date: Date;
  checkout_out_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ResidentMonthlyRentRow {
  kuid: string;
  resident_kuid: string;
  rent_period: Date;
  total_amount: number;
  due_date: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
}