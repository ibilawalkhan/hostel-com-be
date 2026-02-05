export interface User {
  kuid: string;
  email: string;
  name: string;
  terms_accepted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface SafeUser extends Omit<User, 'is_locked'> {
}
