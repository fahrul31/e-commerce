

// app/api/admin/shipments/track/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Endpoint untuk melacak status pengiriman berdasarkan nomor resi dan kurir
export async function POST(request) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: role admin diperlukan" },
            { status: 403 }
        );
    }

    const { trackingNumber, courier } = await request.json();

    const API_KEY = process.env.RAJA_ONGKIR_API;
    const TRACK_URL = 'https://rajaongkir.komerce.id/api/v1/track/waybill';

    if (!trackingNumber || !courier) {
        return NextResponse.json(
            { success: false, message: "Tracking number and courier are required" },
            { status: 400 }
        );
    }

    try {
        const trackRes = await fetch(`${TRACK_URL}?awb=${trackingNumber}&courier=${courier}`, {
            method: 'POST',
            headers: {
                key: API_KEY,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });

        const trackData = await trackRes.json();

        if (!trackRes.ok || !trackData.data) {
            return NextResponse.json(
                { success: false, message: trackData.meta?.message || "Tracking failed" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: trackData.data, // Data tracking yang dikembalikan oleh Raja Ongkir
        });
    } catch (error) {
        console.error("Tracking error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Tracking API error" },
            { status: 500 }
        );
    }
}




