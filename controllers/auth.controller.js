import User from "../models/user.model.js";
import registerSchema from "../middlewares/validator.js";
import hashPassword from "../utils/hashing.js";

export const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Validate the user input
        const {error, value} = registerSchema.validate({ email, password });
        if (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.details[0].message 
            });
        }

        const user = await User.findOne({ email });
        if(user){
            return res.status(401).json({
                success: false,
                message: "User already exists!",
            });
        }

        const hashedPassword = await hashPassword(password, 12);

        const newUser = await User.create({ 
            email, 
            password: hashedPassword 
        });

        // exclude the password from the response
        newUser.password = undefined;

        res.status(201).json({
            success: true,
            message: "Your account has been created successfully!",
            result: newUser,
        });

    } catch (error) {
        console.error("❌ Error on register:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};