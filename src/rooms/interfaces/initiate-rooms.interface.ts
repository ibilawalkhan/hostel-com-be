export interface BedConfiguration {
  bed_id: string;
  occupancy_status: 'Available' | 'Occupied' | 'Reserved';
  monthly_rent: number | null;
}

export interface RoomConfiguration {
  room_type: number;
  room_no: string;
  floor_no: string;
  room_size: string;
  attached_washroom: boolean;
  beds_configuration: BedConfiguration[];
}

export interface InitiateRoomsResponse {
  rooms: RoomConfiguration[];
}
