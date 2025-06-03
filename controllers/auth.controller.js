import User from "../models/user.model.js";
import { registerSchema, loginSchema } from "../middlewares/validator.js";
import { hashPassword, comparePassword } from "../utils/hashing.js";
import jwt from "jsonwebtoken";

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

// Login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Validate the user input
        const {error, value} = loginSchema.validate({ email, password });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const existingUser = await User.findOne({ email }).select('+password');

        if(!existingUser){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare the password
        const isMatch = await comparePassword(password, existingUser.password);

        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified,
        }, process.env.JWT_SECRET, {
            expiresIn: '8h',
        });

        // Set the cookie
        res.cookie("Authorization", 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
        }).json({
            success: true,
            message: "User logged in successfully!",
            token,
        });

    } catch (error) {
        console.error("❌ Error on login:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// Logout
export const logout = async (req, res) => {
    res.clearCookie("Authorization").status(200).json({
        success: true,
        message: "Logged out successfully!",
    });
}