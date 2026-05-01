# Student-Buddy

A Chrome Extension that helps you solve DSA problems on LeetCode with progressive AI-generated hints instead of directly showing the solution.

## Key Features

🔹 Smart Hint System
- 3-level hint system (gradual guidance)
    - Level 1 → subtle clue
    - Level 2 → approach guidance
    - Level 3 → near-solution hint
- Encourages thinking instead of spoon-feeding answers

🔹 Pattern Detection
- Identifies problem-solving patterns (e.g., Hash Map, Two Pointers)

🔹 Seamless Integration
- Automatically extracts problem details (title,description,difficulty)
- Works directly on LeetCode problem pages (more coding platforms in future)
- No manual input required

🔹 Optional Full Solution
- View complete solution only when needed

🔹 User Input Support
- Add your approach/code to get more relevant hints

## Tech Stack
🔹 Frontend (Extension):
- JavaScript (Vanilla)
- HTML + CSS (Custom UI)
- Chrome Extension (Manifest V3)

🔹 Backend:
- Node.js + Express
- LLM-based hint generation 
    - Gemini API (Google Generative AI)


