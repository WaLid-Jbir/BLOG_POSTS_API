import { createPostSchema } from "../middlewares/validator.js";
import Post from "../models/post.model.js";

// Get All Posts
export const getAllPosts = async (req, res) => {
    const {page} = req.query;
    const postsPerPage = 10;

    try {
        let pageNumber = 0;
        if (page <= 1) {
            pageNumber = 0;
        }else{
            pageNumber = page - 1;
        }

        const result = await Post.find().sort({ createdAt: -1 }).skip(pageNumber * postsPerPage).limit(postsPerPage).populate({
            path: "author",
            select: "email",
        });

        res.status(200).json({
            success: true,
            message: "Posts fetched successfully",
            data: result,
        });
    } catch (error) {
        console.error("❌ Error on Getting All Posts:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Get signle post
export const getSinglePost = async (req, res) => {
    const {_id} = req.query;

    try {
        const result = await Post.findOne({ _id }).populate({
            path: "author",
            select: "email",
        });

        res.status(200).json({
            success: true,
            message: "Single post fetched successfully",
            data: result,
        });
    } catch (error) {
        console.error("❌ Error on Getting Single Post:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Create post
export const createPost = async (req, res) => {
    const { title, content } = req.body;
    const author = req.user.userId;
    try {
        // Validate the request body
        const {error, value} = createPostSchema.validate({ title, content, author });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        // Create a new post
        const result = await Post.create({ title, content, author });

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: result,
        });

    } catch (error) {
        console.error("❌ Error on Creating Post:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
