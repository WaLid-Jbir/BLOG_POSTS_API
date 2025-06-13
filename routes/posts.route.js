import express from "express";
import { 
    getAllPosts,
    createPost,
    getSinglePost,
    updatePost
} from "../controllers/posts.controller.js";
import { identifier } from '../middlewares/identification.js';

const router = express.Router();

router.get("/all-posts", getAllPosts );
router.get("/single-post", getSinglePost );
router.post("/create-post", identifier, createPost );
router.put("/update-post", identifier, updatePost );

export default router;