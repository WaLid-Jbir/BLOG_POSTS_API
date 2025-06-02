import bcrypt from "bcryptjs";

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