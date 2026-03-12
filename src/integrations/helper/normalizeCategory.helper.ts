function normalizeCategory(raw: string | undefined): 'hostels' | 'rooms' | 'payments' | 'users' | 'misc' {
    const value = (raw || '').toLowerCase();
    if (value === 'hostels' || value === 'hostel') return 'hostels';
    if (value === 'rooms' || value === 'room') return 'rooms';
    if (value === 'payments' || value === 'payment') return 'payments';
    if (value === 'users' || value === 'user') return 'users';
    return 'misc';
}

export { normalizeCategory };