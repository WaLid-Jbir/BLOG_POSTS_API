import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true, // to remove extra spaces
        unique: [true, 'Email already exists'],
        minLength: [5, 'Email must be at least 5 characters'],
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        select: false, // to not show the password in the response
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        select: false,
    },
    verificationCodeValidation: {
        type: Number,
        select: false,
    },
    forgotPasswordCode: {
        type: String,
        select: false,
    },
    forgotPasswordCodeValidation: {
        type: Number,
        select: false,
    },
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
export default User;