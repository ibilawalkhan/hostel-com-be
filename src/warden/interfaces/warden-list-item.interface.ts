export interface WardenListItem {
  name: string;
  status: string;
  email: string | null;
  phone: string;
  assigned_hostel_name: string;
  branch: string | null;
  permissions: string[];
  created_at: string;
}
