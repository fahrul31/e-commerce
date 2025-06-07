import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getToken } from "next-auth/jwt";

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

    const search = request.nextUrl.searchParams.get("search") || ""; // Nama pemesan

    let whereClause = "";
    let params = [];

    if (search) {
        whereClause = "WHERE u.name LIKE ?";
        params.push(`%${search}%`);
    }

    try {
        // Menghitung jumlah pesanan yang sesuai dengan filter pencarian
        const countQuery = `
            SELECT COUNT(o.id) as count
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ${whereClause}
        `;
        const countResult = await db.query(countQuery, params);
        const count = countResult[0][0].count;

        // Mengambil data pesanan utama (status pesanan, nama pemesan, transaksi)
        const dataQuery = `
            SELECT o.id, o.user_id, o.total_price, o.status, o.created_at, o.updated_at,
                u.name AS customer_name,
                t.reference AS transaction_reference, t.status AS transaction_status
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN transactions t ON o.id = t.order_id
            ${whereClause}
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `;
        params.push(limit, offset);
        const [orders] = await db.query(dataQuery, params);

        // Mengambil data order_items dengan nama produk
        const orderItemQuery = `
            SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name AS product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id IN (${orders.map(() => "?").join(",")})
        `;
        const orderIds = orders.map(order => order.id);
        const [orderItems] = await db.query(orderItemQuery, orderIds);

        // Menambahkan rincian order_items ke setiap pesanan
        orders.forEach(order => {
            order.items = orderItems.filter(item => item.order_id === order.id);
        });

        // Menghitung halaman terakhir
        const lastPage = Math.ceil(count / limit);
        const paginationInfo = {
            count,
            currentPage: page,
            nextPage: page < lastPage ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
        };

        return NextResponse.json({
            success: true,
            data: {
                result: orders,
                paginationInfo,
            },
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

// Fungsi untuk mengupdate status pesanan menjadi 'received'
export async function PATCH(request) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.role || token.role !== "admin") {
        return NextResponse.json(
            { success: false, message: "Unauthorized: role admin diperlukan" },
            { status: 403 }
        );
    }

    const { orderId, trackingNumber } = await request.json();

    try {
        // Cek status pesanan
        const checkOrderStatusQuery = `
            SELECT status FROM orders WHERE id = ?
        `;
        const [statusResult] = await db.query(checkOrderStatusQuery, [orderId]);

        if (statusResult.length === 0) {
            return NextResponse.json(
                { success: false, message: "Pesanan tidak ditemukan" },
                { status: 404 }
            );
        }

        const orderStatus = statusResult[0].status;

        // Validasi status pesanan: Harus "received" sebelum bisa dikirim
        if (orderStatus === "pending") {
            const updateOrderQuery = `
                UPDATE orders
                SET status = 'received'
                WHERE id = ?
            `;
            await db.query(updateOrderQuery, [orderId]);
            return NextResponse.json({
                success: true,
                message: "Pesanan diterima dan siap untuk pengiriman.",
            });
        } else if (orderStatus === "received") {

            // Validasi: Pastikan nomor resi tidak kosong
            if (trackingNumber && trackingNumber.trim() === "") {
                return NextResponse.json(
                    { success: false, message: "Nomor resi tidak boleh kosong" },
                    { status: 400 }
                );
            }

            const [existingShipment] = await db.query(
                `SELECT * FROM shipments WHERE order_id = ?`,
                [orderId]
            );


            if (existingShipment.length > 0) {
                await db.execute(
                    `UPDATE shipments SET reference = ?, status = 'shipped' WHERE order_id = ?`,
                    [trackingNumber, orderId]
                );
            }

            // Update status pesanan menjadi 'shipped'
            await db.execute(
                `UPDATE orders SET status = 'shipped' WHERE id = ?`,
                [orderId]
            );

            return NextResponse.json({
                success: true,
                message: "Pesanan dikirim dan nomor resi telah diperbarui.",
            });
        } else {
            return NextResponse.json(
                { success: false, message: "Status pesanan tidak valid untuk perubahan" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error updating order and shipment:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update order and shipment" },
            { status: 500 }
        );
    }
}



// Menambahkan nomor resi (tracking number) pengiriman
export async function PUT(req) {
    try {
        const { orderId, trackingNumber } = await req.json();


        const [existingShipment] = await db.query(
            `SELECT * FROM shipments WHERE order_id = ?`,
            [orderId]
        );


        if (existingShipment.length > 0) {
            await db.execute(
                `UPDATE shipments SET reference = ?, status = 'shipped' WHERE order_id = ?`,
                [trackingNumber, orderId]
            );
        }

        // Update status pesanan menjadi 'shipped'
        await db.execute(
            `UPDATE orders SET status = 'shipped' WHERE id = ?`,
            [orderId]
        );


        return NextResponse.json({ success: true, message: "Nomor resi berhasil ditambahkan" });
    } catch (error) {
        console.error("Error adding tracking number:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}





