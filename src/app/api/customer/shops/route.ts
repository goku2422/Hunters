import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const allShops = await db.getShops();
    const shops = allShops
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
