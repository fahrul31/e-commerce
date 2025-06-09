import { hash } from "../../../utils/hashing/hashing";
import db from "../../../../lib/db";
import { NextResponse } from "next/server";
import transporter from "@/lib/nodemailer";

export async function POST(request) {
    try {
        const body = await request.json();

        const { name, email, password } = body;

        // Input validation
        if (!name || !email || !password) {
            console.log("Validation failed: Missing required fields");
            return NextResponse.json(
                response(false, "Semua field harus diisi"),
                { status: 400 }
            );
        }

        // Check if email already exists
        console.log("Checking for existing email:", email);
        const [[existingUser]] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );


        if (existingUser) {
            console.log("Registration failed: Email already exists");
            return NextResponse.json(
                { success: false, message: "Email sudah terdaftar" },
                { status: 409 }
            );
        }

        console.log("Hashing password...");
        const hashedPassword = await hash(password);

        // Start transaction
        console.log("Starting database transaction...");
        await db.query('START TRANSACTION');

        try {
            // Insert ke users
            console.log("Inserting user data...");
            const [userResult] = await db.query(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                [name, email, hashedPassword]
            );
            console.log("User insert result:", userResult);
            const userId = userResult.insertId;
            console.log("User inserted with ID:", userId);


            // Commit transaction
            console.log("Committing transaction...");
            await db.query('COMMIT');

            const customerMailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: `Registrasi Akun Berhasil - Selamat datang, ${name}!`,
                html: `
                    <p>Halo <strong>${name}</strong>,</p>
                    <p>Terima kasih telah melakukan registrasi di layanan kami.</p>
                    <p>Berikut adalah detail akun Anda:</p>
                    <ul>
                        <li>Email: ${email}</li>
                        <li>Nama: ${name}</li>
                    </ul>
                    <p>Anda sekarang dapat login dan menikmati layanan kami.</p>
                    <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.</p>
                    <p>Salam hangat,<br/>Tim Support</p>
                `,
            };

            // Kirim email ke customer yang melakukan registrasi
            await transporter.sendMail(customerMailOptions);

            return NextResponse.json({
                success: true,
                message: "Registrasi berhasil"
            }, { status: 200 }
            );
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (e) {
        console.error("Registration error:", e);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan saat registrasi" },
            { status: 500 }
        );
    }
}
