import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getToken } from "next-auth/jwt";

// GET /api/cart?user_id=123  - fetch cart items for a user
export async function GET(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: token diperlukan" },
            { status: 403 }
        );
    }

    const user_id = token.id

    try {
        const [rows] = await db.query(
            `SELECT c.id AS cart_id, c.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.description
       FROM carts c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
            [user_id]
        );
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: token diperlukan" },
            { status: 403 }
        );
    }

    console.log(token);

    const user_id = token.id;
    const { product_id, quantity } = await req.json();

    if (!user_id || !product_id) {
        return NextResponse.json(
            { success: false, message: "user_id and product_id are required" },
            { status: 400 }
        );
    }

    const qty = parseInt(quantity, 10) || 1;

    try {
        const [existing] = await db.execute(
            `SELECT quantity FROM carts WHERE user_id = ? AND product_id = ?`,
            [user_id, product_id]
        );

        if (existing.length > 0) {
            await db.execute(
                `UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?`,
                [qty, user_id, product_id]
            );
        } else {
            await db.execute(
                `INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)`,
                [user_id, product_id, qty]
            );
        }

        return NextResponse.json({ success: true, message: "Cart berhasil diperbarui" });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// POST /api/cart  - add or update cart item
export async function PATCH(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: token diperlukan" },
            { status: 403 }
        );
    }

    const user_id = token.id

    const body = await req.json();
    const { product_id, quantity } = body;

    if (!product_id || quantity < 1) {
        return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
    }

    await db.query(
        `UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [quantity, user_id, product_id]
    );

    return NextResponse.json({ success: true, message: "Quantity updated" });
}


// DELETE /api/cart  - remove item from cart
export async function DELETE(req) {

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: token diperlukan" },
            { status: 403 }
        );
    }

    const user_id = token.id
    const { product_id } = await req.json();
    if (!user_id || !product_id) {
        return NextResponse.json(
            { success: false, message: "user_id and product_id are required" },
            { status: 400 }
        );
    }
    try {
        await db.execute(
            "DELETE FROM carts WHERE user_id = ? AND product_id = ?",
            [user_id, product_id]
        );
        return NextResponse.json({ success: true, message: "Item berhasil dihapus" });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
