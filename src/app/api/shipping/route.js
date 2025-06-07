// app/api/admin/shipments/route.js

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getToken } from "next-auth/jwt";

// Endpoint untuk mengambil daftar pesanan dengan status 'shipped' dan nomor resi
export async function GET(request) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.role || token.role !== "admin") {
        return NextResponse.json(
            { success: false, message: "Unauthorized: role admin diperlukan" },
            { status: 403 }
        );
    }

    const page = parseInt(request.nextUrl.searchParams.get("page")) || 1;
    const limit = parseInt(request.nextUrl.searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    try {
        const query = `
            SELECT o.id, o.user_id, o.total_price, o.status, o.created_at, o.updated_at,
                   s.reference as tracking_number, s.courier as courier, s.status as shipment_status
            FROM orders o
            JOIN shipments s ON o.id = s.order_id
            WHERE o.status = 'shipped' AND s.reference IS NOT NULL
            LIMIT ? OFFSET ?
        `;
        const [orders] = await db.query(query, [limit, offset]);

        // Query untuk menghitung total pesanan
        const countQuery = `SELECT COUNT(o.id) as total_count FROM orders o WHERE o.status = 'shipped'`;
        const [countResult] = await db.query(countQuery);
        const totalCount = countResult[0].total_count;

        const lastPage = Math.ceil(totalCount / limit);
        const paginationInfo = {
            count: totalCount,
            currentPage: page,
            nextPage: page < lastPage ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
        };

        return NextResponse.json({
            success: true,
            data: {
                orders,
                paginationInfo,
            },
        });
    } catch (error) {
        console.error("Error fetching shipments:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch shipments" },
            { status: 500 }
        );
    }
}


export async function POST(req) {
    try {
        const { zipCode, originId, weight, couriers = ['jne', 'jnt', 'sicepat'] } = await req.json();

        if (!zipCode || !originId || !weight) {
            return Response.json({ error: 'zipCode, originId, dan weight wajib diisi' }, { status: 400 });
        }

        const API_KEY = process.env.RAJA_ONGKIR_API;
        const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';
        const DEST_URL = `${BASE_URL}/destination/domestic-destination`;
        const COST_URL = `${BASE_URL}/calculate/domestic-cost`;

        // 1. Cari data destinasi berdasarkan zipCode
        const destRes = await fetch(`${DEST_URL}?search=${zipCode}`, {
            method: 'GET',
            headers: {
                key: API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const destData = await destRes.json();

        if (!destData.data || !Array.isArray(destData.data)) {
            return Response.json({ error: 'Data tujuan tidak ditemukan' }, { status: 404 });
        }

        const matchingDest = destData.data.find(d => d.zip_code === zipCode);
        if (!matchingDest) {
            return Response.json({ error: 'Destination not found for provided zipCode' }, { status: 404 });
        }

        // 2. Kirim body dalam bentuk x-www-form-urlencoded
        const bodyParams = new URLSearchParams();
        bodyParams.append('origin', originId);
        bodyParams.append('destination', matchingDest.id);
        bodyParams.append('weight', weight);
        bodyParams.append('courier', couriers.join(':'));

        const costRes = await fetch(COST_URL, {
            method: 'POST',
            headers: {
                key: API_KEY,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyParams
        });

        const costData = await costRes.json();

        if (!costRes.ok) {
            return Response.json({ error: costData.meta?.message || 'Gagal hitung ongkir' }, { status: 400 });
        }

        return Response.json({
            success: true,
            data: {
                destination: matchingDest,
                costs: costData.data
            },
            message: "Profile fetched successfully",

        });
    } catch (error) {
        console.error('Shipping API error:', error);
        return Response.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
