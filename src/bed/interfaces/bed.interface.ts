export interface BedRow {
  kuid: string;
  room_kuid: string;
  bed_no: string;
  monthly_rent: string | null;
  bed_photos_url: string[] | null;
  bed_occupied_enum: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
