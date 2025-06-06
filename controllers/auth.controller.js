import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { registerSchema, loginSchema, acceptCodeSchema, changePasswordSchema } from "../middlewares/validator.js";
import { hashPassword, comparePassword, hmacProcess } from "../utils/hashing.js";
import transporter from "../config/mailer.js";

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

// Send verification code on email
export const sendVerificationCode = async (req, res) => {
    const { email } = req.body;
    try {
        // check if user exists
        const existingUser = await User.findOne({ email });
        if(!existingUser){
            return res.status(404).json({
                success: false,
                message: "User does not exist!",
            });
        }

        // check if user is already verified
        if(existingUser.verified){
            return res.status(400).json({
                success: false,
                message: "Your account is already verified!",
            });
        }

        // generate a random 6 digit code
        const verificationCode = Math.floor(Math.random() * 1000000).toString();

        const info = await transporter.sendMail({
            // from: process.env.EMAIL_USER,
            to: existingUser.email,
            subject: "Verification Code",
            html: ` 
                <h1>Verification Code</h1>
                <p>Your verification code is ${verificationCode}</p>
            `,
        });

        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue = hmacProcess(verificationCode, process.env.HMAC_SECRET);

            // update the user with the verification code
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now() + 10 * 60 * 1000;
            await existingUser.save();

            return res.status(200).json({
                success: true,
                message: "Verification code sent successfully!",
            });
        }

        res.status(400).json({
            success: false,
            message: "Verification code could not be sent!",
        });

    } catch (error) {
        console.error("❌ Error on Sending Verification Code:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
        
    }
}

export const verifyVerificationCode = async (req, res) => {
    const { email, providedCode } = req.body;

    try {
        // validation
        const {error, value} = acceptCodeSchema.validate({ email, providedCode });
        if (error) {
            return res.status(401).json({
                success: false,
                message: error.details[0].message
            });
        }

        const codeValue = providedCode.toString();

        const existingUser = await User.findOne({ email }).select('+verificationCode +verificationCodeValidation');
        if(!existingUser){
            return res.status(404).json({
                success: false,
                message: "User does not exist!",
            });
        }

        if(existingUser.verified){
            return res.status(400).json({
                success: false,
                message: "Your account is already verified!",
            });
        }

        if(!existingUser.verificationCode || !existingUser.verificationCodeValidation){
             return res.status(400).json({
                success: false,
                message: "Something went wrong with the verification code!",
            });
        }

        if(Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000){
            return res.status(400).json({
                success: false,
                message: "Verification code has expired!",
            });
        }

        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_SECRET);

        if(existingUser.verificationCode === hashedCodeValue){
            // update the user with the verification code
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();

            return res.status(200).json({
                success: true,
                message: "Your account has been verified successfully!",
            });
        }

        return res.status(400).json({
            success: false,
            message: "Invalid verification code!",
        });

    } catch (error) {
        console.error("❌ Error on Verifying Verification Code:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// change password
export const changePassword = async (req, res) => {
    const { userId, verified } = req.user;
    const { oldPassword, newPassword } = req.body;
    try {
        // validation
        const {error, value} = changePasswordSchema.validate({ oldPassword, newPassword });
        if (error) {
            return res.status(401).json({
                success: false,
                message: error.details[0].message
            });
        }

        if(!verified){
            return res.status(401).json({
                success: false,
                message: "Your account is not verified!",
            });
        }

        const existingUser = await User.findById(userId).select('+password');

        if(!existingUser){
            return res.status(404).json({
                success: false,
                message: "User does not exist!",
            });
        }

        const result = await comparePassword(oldPassword, existingUser.password);

        if(!result){
            return res.status(400).json({
                success: false,
                message: "Invalid credeentials!",
            });
        }

        const hashedPassword = await hashPassword(newPassword, 12);
        existingUser.password = hashedPassword;
        await existingUser.save();

        return res.status(200).json({
            success: true,
            message: "Your password has been changed successfully!",
        });

    } catch (error) {
        console.error("❌ Error on Changing Password:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
        
    }
}

// forgot password
export const sendForgotPasswordCode = async (req, res) => {
    const { email } = req.body;
    try {
        // check if user exists
        const existingUser = await User.findOne({ email });
        if(!existingUser){
            return res.status(404).json({
                success: false,
                message: "User does not exist!",
            });
        }

        // generate a random 6 digit code
        const verificationCode = Math.floor(Math.random() * 1000000).toString();

        const info = await transporter.sendMail({
            // from: process.env.EMAIL_USER,
            to: existingUser.email,
            subject: "Forgot Password Verification Code",
            html: ` 
                <h1>Forgot password verification code</h1>
                <p>Your forgot password verification code is ${verificationCode}</p>
            `,
        });

        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue = hmacProcess(verificationCode, process.env.HMAC_SECRET);

            // update the user with the verification code
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now() + 10 * 60 * 1000;
            await existingUser.save();

            return res.status(200).json({
                success: true,
                message: "Forgot password verification code sent successfully!",
            });
        }

        res.status(400).json({
            success: false,
            message: "Forgot password verification code could not be sent!",
        });

    } catch (error) {
        console.error("❌ Error on Sending Forgot Password Verification Code:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
        
    }
}