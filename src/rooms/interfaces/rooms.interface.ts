export interface RoomRow {
  kuid: string;
  hostel_kuid: string;
  room_type: string;
  room_no: string;
  floor_no: string | null;
  room_size: string | null;
  status: string;
  photos: string[] | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RoomListItemRow {
  room_no: string;
  type: string;
  capacity: number;
  occupied: number;
  empty_count: number;
  status: string;
  price_per_bed: string | null;
}
