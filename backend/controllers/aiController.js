import {generateHints, generateSolution} from "../services/aiService.js";

export const getHints = async(req,res) => {
    try {
        const authHeader = req.headers.authorization;

        let apiKey;

        if (authHeader?.startsWith("Bearer ")) {
            apiKey = authHeader.substring(7); // User's key
        } else {
            apiKey = process.env.GEMINI_API_KEY; // Your key
        }

        let {title, description, difficulty, userCode} = req.body || {};
        console.log("BODY RECEIVED:", req.body);

        if (!title || !description || !difficulty) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        userCode = userCode || "";

        const hints = await generateHints({title, description, difficulty, userCode}, apiKey);
        res.json(hints);
        console.log("HINT RESPONSE:", hints);
    } catch(err) {
        console.log(err);
        if (err.message === "INVALID_API_KEY") {
            return res.status(401).json({
                error: "Invalid Gemini API Key"
            });
        }
        res.status(500).json({ error: "Failed to generate hints" });
    } 
}

export const getSolution = async(req,res) => {
    try {
        const authHeader = req.headers.authorization;

        let apiKey;

        if (authHeader?.startsWith("Bearer ")) {
            apiKey = authHeader.substring(7); // User's key
        } else {
            apiKey = process.env.GEMINI_API_KEY; // Your key
        }

        const {title, description, difficulty, userCode, language} = req.body || {};
        const solution = await generateSolution({title, description, difficulty, userCode, language}, apiKey);
        res.json({solution});
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: "Failed to generate solution" });
    } 
}