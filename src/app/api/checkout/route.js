import { NextResponse } from "next/server";
import db from "@/lib/db";
import midtransClient from "midtrans-client";
import transporter from "@/lib/nodemailer";
import { getToken } from "next-auth/jwt";

export async function POST(request) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: token diperlukan" },
            { status: 403 }
        );
    }

    const {
        user_id,
        user_email,
        shipping_name,
        shipping_contact,
        shipping_address,
        shipping_courier,
        shipping_service,
        shipping_cost
    } = await request.json();

    if (!user_id || !shipping_name || !shipping_address || !shipping_courier || !shipping_service || shipping_cost === undefined) {
        return NextResponse.json(
            { success: false, message: "Incomplete checkout data" },
            { status: 400 }
        );
    }

    // Function to normalize shipping service name
    const formatShippingService = (service) => {
        const lowerService = service.toLowerCase().replace(/[^a-z\s]/g, "");

        if (/\b(j\s?&\s?t\s?express)\b/.test(lowerService)) return "jnt";
        if (/\b(jalur\s?nugraha\s?ekakurir|jne)\b/.test(lowerService)) return "jne";

        // Check for the general terms
        if (lowerService.includes("j&t")) return "jnt";
        if (lowerService.includes("jnt")) return "jnt";
        if (lowerService.includes("jne")) return "jne";
        if (lowerService.includes("sicepat")) return "sicepat";

        return lowerService;
    };

    // Apply normalization
    const shipping_courier_normalized = formatShippingService(shipping_courier);


    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
        // 1. Fetch cart items
        const [items] = await conn.query(
            `SELECT c.product_id, c.quantity, p.price, p.name
             FROM carts c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`,
            [user_id]
        );

        if (items.length === 0) {
            await conn.rollback();
            conn.release();
            return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
        }

        // 2. Calculate total
        let total_price = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        total_price = total_price + shipping_cost;

        // 3. Create order
        const [orderResult] = await conn.execute(
            `INSERT INTO orders (user_id, total_price, status)
             VALUES (?, ?, 'pending')`,
            [user_id, total_price]
        );
        const order_id = orderResult.insertId;

        // 4. Insert order_items
        for (const i of items) {
            await conn.execute(
                `INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES (?, ?, ?, ?)`,
                [order_id, i.product_id, i.quantity, i.price]
            );
        }

        // 5. Create Snap Token via Midtrans
        const snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY
        });

        const reference = `TRX_${Date.now()}`;

        const parameter = {
            transaction_details: {
                reference: reference,
                order_id: order_id,
                gross_amount: total_price
            },
            customer_details: {
                first_name: shipping_name,
                phone: shipping_contact,
                address: shipping_address
            },
            item_details: [
                ...items.map(i => ({
                    id: i.product_id.toString(),
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price
                })),
                {
                    id: "shipping",
                    name: `Ongkir (${shipping_courier.toUpperCase()} - ${shipping_service})`,
                    quantity: 1,
                    price: shipping_cost
                }
            ]
        };

        const snapResponse = await snap.createTransaction(parameter);

        // 6. Insert transaction with snap_token
        await conn.execute(
            `INSERT INTO transactions (reference, order_id, status, payment_method, paid_at)
             VALUES (?, ?, 'pending', '', NULL)`,
            [reference, order_id]
        );

        // 7. Simpan data shipments 
        await conn.execute(
            `INSERT INTO shipments (order_id, status, courier, service, cost)
             VALUES (?, 'pending', ?, ?, ?)`,
            [order_id, shipping_courier_normalized, shipping_service, shipping_cost]
        );

        // 8. Clear cart
        await conn.execute("DELETE FROM carts WHERE user_id = ?", [user_id]);


        //9. Mengirimkan email ke pembeli dengan link pembayaran
        const mailOptions = {
            from: process.env.EMAIL,
            to: user_email,
            subject: "Tindak lanjut pembayaran",
            html: `
                <p>Terima kasih telah melakukan pembelian di toko kami.</p>
                <p>Untuk menyelesaikan transaksi, silakan klik link berikut untuk melakukan pembayaran:</p>
                <a href="${snapResponse.redirect_url}" target="_blank">Bayar Sekarang</a>
                <p>Link ini hanya berlaku selama 24 jam. Jangan lewatkan kesempatan ini untuk menyelesaikan pembayaran.</p>
                <p>Terima kasih atas kepercayaan Anda.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        await conn.commit();
        conn.release();

        return NextResponse.json({
            success: true,
            data: {
                order_id,
                reference,
                snap_token: snapResponse.token,
                snap_redirect_url: snapResponse.redirect_url
            },
            message: "Checkout successful"
        });
    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error("Checkout error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
