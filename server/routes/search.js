import express from "express";
import { 
    search      // New import for sharing
  } from "../controllers/search.js";
const router = express.Router();

// Search route
router.get('/', search);

export default router;