import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [categories] = await db.query("SELECT * FROM categories ORDER BY name ASC");

        return NextResponse.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to fetch categories",
            },
            { status: 500 }
        );
    }
}


