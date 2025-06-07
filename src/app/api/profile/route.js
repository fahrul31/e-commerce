import db from "@/lib/db";
import { NextResponse } from "next/server";
import * as bcrypt from "@/app/utils/hashing/hashing";
import { getToken } from "next-auth/jwt";

export async function GET(request) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: token diperlukan" },
            { status: 403 }
        );
    }

    try {
        const [userRows] = await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [token.id]);
        const user = userRows[0];

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" });
        }

        // Fetch user's addresses
        const [addressRows] = await db.query("SELECT * FROM addresses WHERE user_id = ?", [token.id]);

        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            addresses: addressRows
        };

        return NextResponse.json({
            success: true,
            data: userData,
            message: "Profile fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: token diperlukan" },
            { status: 403 }
        );
    }

    try {
        const id = token.id;
        const body = await request.json();
        const { name, email, currentPassword, newPassword, phone, address } = body;

        if (!name && !email && !phone && !address && !newPassword) {
            return NextResponse.json({ success: false, message: "Minimal satu data harus diubah" });
        }

        const [rows] = await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
        const user = rows[0];

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" });
        }

        let updateFields = [];
        let updateValues = [];

        if (name) updateFields.push("name = ?"), updateValues.push(name);
        if (email) updateFields.push("email = ?"), updateValues.push(email);
        if (phone) updateFields.push("phone = ?"), updateValues.push(phone);

        if (currentPassword && newPassword) {
            const isPasswordValid = await bcrypt.verify(currentPassword, user.password);
            if (!isPasswordValid) {
                return NextResponse.json({ success: false, message: "Current password is incorrect" });
            }

            const hashedPassword = await bcrypt.hash(newPassword);
            updateFields.push("password = ?");
            updateValues.push(hashedPassword);
        }

        if (updateFields.length > 0) {
            updateValues.push(id);
            const query = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
            await db.query(query, updateValues);
        }

        // Handle address update if provided
        if (address) {
            const { id: addressId, full_address, city, postal_code, is_primary } = address;

            if (addressId) {
                // If setting as primary, unset other primary addresses first
                if (is_primary) {
                    await db.query(
                        "UPDATE addresses SET is_primary = FALSE WHERE user_id = ?",
                        [id]
                    );
                }

                // Update existing address
                await db.query(
                    "UPDATE addresses SET full_address = ?, city = ?, postal_code = ?, is_primary = ? WHERE id = ? AND user_id = ?",
                    [full_address, city, postal_code, is_primary, addressId, id]
                );
            } else {
                // Check if user already has 3 addresses
                const [addressCount] = await db.query(
                    "SELECT COUNT(*) as count FROM addresses WHERE user_id = ?",
                    [id]
                );

                if (addressCount[0].count >= 3) {
                    return NextResponse.json({
                        success: false,
                        message: "Maksimal 3 alamat yang dapat ditambahkan"
                    });
                }

                // If setting as primary, unset other primary addresses first
                if (is_primary) {
                    await db.query(
                        "UPDATE addresses SET is_primary = FALSE WHERE user_id = ?",
                        [id]
                    );
                }

                // Insert new address
                await db.query(
                    "INSERT INTO addresses (user_id, full_address, city, postal_code, is_primary) VALUES (?, ?, ?, ?, ?)",
                    [id, full_address, city, postal_code, is_primary]
                );
            }
        }

        // Fetch updated user data
        const [updatedUser] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
        const [addresses] = await db.query("SELECT * FROM addresses WHERE user_id = ?", [id]);

        const userData = {
            id: updatedUser[0].id,
            email: updatedUser[0].email,
            name: updatedUser[0].name,
            phone: updatedUser[0].phone,
            role: updatedUser[0].role,
            addresses: addresses
        };

        return NextResponse.json({
            success: true,
            data: userData,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// New endpoint to delete an address
export async function DELETE(request) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: token diperlukan" },
            { status: 403 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const addressId = searchParams.get('addressId');

        if (!addressId) {
            return NextResponse.json({ success: false, message: "Address ID is required" });
        }

        // Delete the address
        await db.query(
            "DELETE FROM addresses WHERE id = ? AND user_id = ?",
            [addressId, token.id]
        );

        return NextResponse.json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting address:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}