import bcrypt from "bcryptjs";

const SALT_OR_ROUNDS = 10;

export function hash(password) {
    return bcrypt.hash(password, SALT_OR_ROUNDS);
}

export function verify(password, encrypted) {
    return bcrypt.compare(password, encrypted);
}