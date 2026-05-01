import express from "express";
import { getHints, getSolution } from "../controllers/aiController.js";

const router = express.Router();

router.post("/get-hints", getHints);
router.post("/get-solution", getSolution);

export default router;