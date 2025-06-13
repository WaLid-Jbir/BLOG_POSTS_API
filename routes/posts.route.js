import express from "express";
import { 
    getAllPosts,
    createPost,
    getSinglePost
} from "../controllers/posts.controller.js";
import { identifier } from '../middlewares/identification.js';

const router = express.Router();

router.get("/all-posts", getAllPosts );
router.post("/create-post", identifier, createPost );
router.get("/single-post", getSinglePost );

export default router;