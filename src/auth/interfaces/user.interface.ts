export interface User {
  kuid: string;
  full_name: string;
  phone: string;
  email: string | null;
  cnic_number: string | null;
  cnic_front: string | null;
  cnic_back: string | null;
  selfie: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface SafeUser extends Omit<User, 'password'> {
}
