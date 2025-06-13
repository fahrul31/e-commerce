import db from "../../../lib/db";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getToken } from "next-auth/jwt";

export async function GET(request) {
    const page = parseInt(request.nextUrl.searchParams.get("page")) || 1;
    const limit = parseInt(request.nextUrl.searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    const search = request.nextUrl.searchParams.get("search") || "";
    const category_id = request.nextUrl.searchParams.get("category_id") || null;
    const sort = request.nextUrl.searchParams.get("sort") || null;

    let whereClause = "";
    let params = [];

    if (search && category_id) {
        whereClause = "WHERE name LIKE ? AND category_id = ?";
        params.push(`%${search}%`, category_id);
    } else if (search) {
        whereClause = "WHERE name LIKE ?";
        params.push(`%${search}%`);
    } else if (category_id) {
        whereClause = "WHERE category_id = ?";
        params.push(category_id);
    }

    // Add featured filter
    if (sort === "1" || sort === "0") {
        whereClause += whereClause ? " AND featured = ?" : "WHERE featured = ?";
        params.push(sort);
    }

    // Sorting by price
    let orderClause = "";
    if (sort === "termurah") orderClause = "ORDER BY price ASC";
    else if (sort === "termahal") orderClause = "ORDER BY price DESC";

    try {
        const countQuery = `SELECT COUNT(id) as count FROM products ${whereClause}`;
        const countResult = await db.query(countQuery, params);
        const count = countResult[0][0].count;

        const dataQuery = `SELECT * FROM products ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        const [result] = await db.query(dataQuery, params);

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
                result,
                paginationInfo,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch products" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.role || token.role !== "admin") {
        return NextResponse.json(
            { success: false, message: "Unauthorized: role admin diperlukan" },
            { status: 403 }
        );
    }

    try {
        const formData = await req.formData();

        const name = formData.get("name");
        const description = formData.get("description") || "";
        const price = formData.get("price");
        const category_id = formData.get("category_id") || null;
        const image = formData.get("image");
        const featured = formData.get("featured")

        if (!name || !price) {
            return NextResponse.json(
                { success: false, message: "nama dan harga produk is required" },
                { status: 400 }
            );
        }

        let imageUrl = null;

        if (image && typeof image === "object") {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`;

            const resCloudinary = await cloudinary.uploader.upload(base64Image, {
                folder: "products",
                resource_type: "image",
            });

            imageUrl = resCloudinary.secure_url;
        }

        await db.execute(
            "INSERT INTO products (name, description, price, image_url, category_id, featured) VALUES (?, ?, ?, ?, ?, ?)",
            [name, description, price, imageUrl, category_id, featured]
        );

        return NextResponse.json({ success: true, message: "Product berhasil ditambahkan" }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { success: false, message: `Failed to add product, ${error.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}
