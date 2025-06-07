// import { NextResponse } from "next/server";
// import * as JWT from "@/app/utils/jwt/jwt";
// import db from "@/lib/db";
// import { verify } from "@/app/utils/hashing/hashing";
// import { response, responseSuccessWithData } from "@/app/utils/helper/response";


// export async function POST(request) {

//     const { email, password } = await request.json();

//     const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
//     const user = rows[0]

//     const isPasswordValid = await verify(password, user.password);

//     if (!user || !isPasswordValid) {
//         return NextResponse.json(response(false, "Invalid email or password"));
//     }

//     const accessToken = await JWT.encode({ id: user.id, role: user.role }, "24h");
//     return NextResponse.json(responseSuccessWithData(
//         true,
//         "User logged in successfully",
//         { token: accessToken }
//     )
//     );
// }