export interface HostelRow {
    kuid: string;
    owner_kuid: string;
    name: string;
    city_kuid: string | null;
    area_kuid: string | null;
    full_address_text: string | null;
    latitude: string | null;
    longitude: string | null;
    near_by: string | null;
    gender_allowed: string | null;
    type: string | null;
    visitor_policy: string | null;
    smoking: string | null;
    admission_photos_url: string[] | null;
    reception_photos_url: string[] | null;
    mess_area_photos_url: string[] | null;
    parking_type: string | null;
    security_deposit: string | null;
    admission_fee: string | null;
    created_at: Date;
    updated_at: Date;
  }

  export interface ListHostelItem {
    hostel_name: string;
    branch_no: string | null;
    status: string | null;
    address: string | null;
    total_rooms: number;
    total_beds: number;
    total_occupancy: number;
    warden_name: string | null;
  }

  export interface HostelStats {
    total_hostels: number;
    total_rooms: number;
    total_beds: number;
    avg_occupancy: number;
  }
  