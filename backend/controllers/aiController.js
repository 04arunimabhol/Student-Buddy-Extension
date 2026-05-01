import {generateHints, generateSolution} from "../services/aiService.js";

export const getHints = async(req,res) => {
    try {
        let {title, description, difficulty, userCode} = req.body || {};
        console.log("BODY RECEIVED:", req.body);

        if (!title || !description || !difficulty) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        userCode = userCode || "";

        const hints = await generateHints({title, description, difficulty, userCode});
        res.json(hints);
        console.log("HINT RESPONSE:", hints);
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: "Failed to generate hints" });
    } 
}

export const getSolution = async(req,res) => {
    try {
        const {title, description, difficulty, userCode, language} = req.body || {};
        const solution = await generateSolution({title, description, difficulty, userCode, language});
        res.json({solution});
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: "Failed to generate solution" });
    } 
}