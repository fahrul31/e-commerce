import db from '@/lib/db';
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req, res) {

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.role || token.role !== "admin") {
        return NextResponse.json(
            { success: false, message: "Unauthorized: role admin diperlukan" },
            { status: 403 }
        );
    }
    const adminId = token.id;
    try {
        const [rows] = await db.query(
            `
            SELECT DISTINCT u.id, u.name, u.email
                FROM conversation_users cu_admin
                JOIN conversation_users cu_user
                    ON cu_admin.conversation_id = cu_user.conversation_id
                JOIN users u ON u.id = cu_user.user_id
                WHERE cu_admin.user_id = ? AND cu_user.user_id != ?;
            `,
            [adminId, adminId]
        );

        console.log(rows);

        return NextResponse.json({
            success: true,
            data: rows,
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching chat users:", error);
        return NextResponse.json(
            { success: false, message: `Failed to fetch chat users, ${error.message || "Unknown error"}` },
            { status: 500 }
        );

    }
}
