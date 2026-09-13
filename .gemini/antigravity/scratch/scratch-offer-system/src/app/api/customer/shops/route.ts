import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const shops = db.getShops()
        .filter((shop) => shop.isActive)
        .map(({ id, name, category, address, phone, isActive }) => ({
            id,
            name,
            category,
            address,
            phone,
            isActive,
        }));

    return NextResponse.json({ success: true, shops });
}
