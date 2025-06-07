import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import db from "@/lib/db";
import { getToken } from "next-auth/jwt";


export async function GET(req, { params }) {
    const id = params.id;
    try {
        const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
        const product = rows[0];
        if (!product) {
            return NextResponse.json({ success: false, message: "Produk tidak ditemukan" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: product });
    } catch (e) {
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}




export async function PUT(req, { params }) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log("Token:", token);

    if (!token || !token.role || token.role !== "admin") {
        return NextResponse.json(
            { success: false, message: "Unauthorized: role admin diperlukan" },
            { status: 403 }
        );
    }


    try {
        const formData = await req.formData();

        const id = params.id;
        const name = formData.get("name");
        const description = formData.get("description") || "";
        const price = formData.get("price");
        const category_id = formData.get("category_id") || null;
        const featured = formData.get("featured") === "true" ? 1 : 0;
        const image = formData.get("image");
        const existingImageUrl = formData.get("image_url");

        if (!id || !name || !price) {
            return NextResponse.json(
                { success: false, message: "id, name, dan price wajib diisi" },
                { status: 400 }
            );
        }

        let imageUrl = existingImageUrl || null;

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
            "UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category_id = ?, featured = ? WHERE id = ?",
            [name, description, price, imageUrl, category_id, featured, id]
        );

        return NextResponse.json({ success: true, message: "Produk berhasil diperbarui" });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal memperbarui produk: " + error.message },
            { status: 500 }
        );
    }
}


export async function DELETE(req, { params }) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log("Token:", token);

    if (!token || !token.role || token.role !== "admin") {
        return NextResponse.json(
            { success: false, message: "Unauthorized: role admin diperlukan" },
            { status: 403 }
        );
    }

    try {
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { success: false, message: "id is required" },
                { status: 400 }
            );
        }

        await db.execute("DELETE FROM products WHERE id = ?", [id]);

        return NextResponse.json({ success: true, message: "Produk berhasil dihapus" });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal menghapus produk: " + error.message },
            { status: 500 }
        );
    }
}