import bcrypt from "bcryptjs";
import { createHmac } from "crypto";

// Haash password
export const hashPassword = async (password, saltValue) => {
    const hashedPassword = await bcrypt.hash(password, saltValue);
    return hashedPassword;
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
};

// HMAC Hash verification code value
export const hmacProcess = (value, secretKey) => {
    const hmac = createHmac('sha256', secretKey).update(value).digest('hex');
    return hmac;
};