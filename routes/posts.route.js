import express from "express";
import { 
    getAllPosts,
    createPost,
    getSinglePost,
    updatePost,
    deletePost
} from "../controllers/posts.controller.js";
import { identifier } from '../middlewares/identification.js';

const router = express.Router();

router.get("/all-posts", getAllPosts );
router.get("/single-post", getSinglePost );
router.post("/create-post", identifier, createPost );
router.put("/update-post", identifier, updatePost );
router.delete("/delete-post", identifier, deletePost );

export default router;