import Post from "../models/post.model.js";

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