import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        minLength: [3, "Title must be at least 3 characters"],
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        trim: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Author is required"],
    },
}, { timestamps: true });

export const Post = mongoose.model("Post", postSchema);