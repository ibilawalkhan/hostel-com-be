import { BedItemDto } from "../dto/create-room.dto";


export function occupancyToEnum(s: string): 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' {

    const u = (s || '').toUpperCase();

    if (u === 'OCCUPIED') return 'OCCUPIED';
    if (u === 'RESERVED') return 'RESERVED';

    return 'AVAILABLE';
}

export function roomStatusFromBeds(beds: BedItemDto[]): 'EMPTY' | 'PARTIAL_OCCUPIED' | 'FULL' {

    if (!beds.length) return 'EMPTY';

    const occupied = beds.filter((b) => (b.occupancy_status || '').toUpperCase() === 'OCCUPIED').length;

    if (occupied === 0) return 'EMPTY';
    if (occupied === beds.length) return 'FULL';

    return 'PARTIAL_OCCUPIED';
}