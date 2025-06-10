import express from "express";
import { 
    getAllPosts,
} from "../controllers/posts.controller.js";

const router = express.Router();

router.get("/all-posts", getAllPosts );

export default router;