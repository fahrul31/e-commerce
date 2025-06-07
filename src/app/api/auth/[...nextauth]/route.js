import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "../../../../lib/db";
import { encode } from "../../../utils/jwt/jwt";
import { hash, verify } from "../../../utils/hashing/hashing";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET_KEY,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const { email, password } = credentials;

                const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
                const user = rows[0];

                if (!user) {
                    throw new Error("Pengguna tidak ditemukan");
                }

                const isPasswordValid = await verify(password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Kata sandi salah");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user }) {
            console.log("SignIn callback dipanggil:", user);

            try {
                const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [user.email]);
                const existingUser = rows[0];

                if (!existingUser) {
                    const hashedPassword = await hash(process.env.DEFAULT_PASSWORD);
                    await db.query(
                        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE role = VALUES(role)",
                        [user.name, user.email, hashedPassword, "customer"]
                    );
                    user.role = "customer";
                } else {
                    console.log("Pengguna sudah ada di database.");
                    user.id = existingUser.id;
                    user.role = existingUser.role;
                }

                return true;
            } catch (error) {
                console.error("Error saat menyimpan ke database:", error);
                return false;
            }
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.accessToken = await encode({ id: user.id, role: user.role }, "24h");
            }
            return token;
        },

        async session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            session.user.accessToken = token.accessToken;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt"
    }
});

export { handler as GET, handler as POST };