import bcrypt from "bcryptjs";

const hashPassword = async (password, saltValue) => {
    const hashedPassword = await bcrypt.hash(password, saltValue);
    return hashedPassword;
};

export default hashPassword;