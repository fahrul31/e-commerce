import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function encode(payload, expirationTime = null) {
    const jwt = new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt();

    if (expirationTime) {
        jwt.setExpirationTime(expirationTime);
    }

    return await jwt.sign(JWT_SECRET);
}

export async function decode(token) {
    return await jwtVerify(token, JWT_SECRET);
}
