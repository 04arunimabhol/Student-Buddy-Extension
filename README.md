# Student Buddy

Student Buddy is a Chrome Extension that helps users solve LeetCode problems through progressive AI-powered hints instead of immediately revealing the solution. It promotes active learning by guiding users toward the correct approach while allowing them to request the full solution only when necessary.

---

## ✨ Features

### 🧠 Progressive AI Hint System
- Three levels of progressively detailed hints:
  - Level 1 – Subtle clue
  - Level 2 – Approach guidance
  - Level 3 – Near-solution explanation
- Encourages problem-solving rather than directly revealing the answer.

### 🎯 Pattern Detection
- Identifies the underlying algorithm or data structure used in the problem.
- Examples:
  - Hash Map
  - Two Pointers
  - Sliding Window
  - Dynamic Programming
  - Graph Traversal
  - And more.

### 📄 Automatic Problem Extraction
- Automatically extracts:
  - Problem title
  - Description
  - Difficulty
- Works directly on LeetCode with no manual copy-pasting.

### 💡 Context-Aware Hint Generation
- Users can optionally enter their current approach or partial code.
- AI generates hints tailored to the user's progress.

### 📝 Multi-Language Solution Generation
Generate complete solutions in:
- Java
- C++
- Python
- JavaScript

### 🔓 Free Trial + Bring Your Own API Key
- Includes free AI usage for the first **2 unique problems**.
- After the free trial, users can securely add their own Gemini API key.
- API keys are stored locally in the browser (`chrome.storage.local`) and never shared with LeetCode.

### ⚙️ Built-in Settings
- Update Gemini API key directly from the extension.
- No need to edit files or reinstall the extension.

### 🖥️ Expandable Output Panel
- View hints and solutions in a larger popup for better readability.

---

## 🛠 Tech Stack

### Frontend (Chrome Extension)
- JavaScript (ES6)
- HTML5
- CSS3
- Chrome Extension Manifest V3

### Backend
- Node.js
- Express.js
- Google Gemini API (`@google/genai`)
- Express Rate Limiter
- CORS

### Storage
- Chrome Storage API (`chrome.storage.local`)

---

## 🚀 How It Works

1. Open any LeetCode problem.
2. Click **Load Problem**.
3. Enter your approach (optional).
4. Request AI-generated hints progressively.
5. Reveal the complete solution only if needed.
6. After the free trial, add your own Gemini API key from the Settings panel.

## 🚀 Live Backend

**Backend API:** https://student-buddy-extension-rust.vercel.app

## Screenshots
### Chrome Extension Interface

![Student Buddy Extension](./screenshots/Student_Buddy_Extension.png)
