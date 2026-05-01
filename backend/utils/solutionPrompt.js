export const buildSolutionPrompt = ({ title, description, difficulty, userCode, language }) => {
  return [
    {
      role: "user",
      parts: [
        {
          text: `
You are a coding expert.

Provide:
1. Clear explanation of approach
2. Clean and correct code
3. Use the requested programming language

RULES:
- Code must be correct and optimized
- Keep explanation simple
- Do not add unnecessary text

PROBLEM DETAILS:
Title: ${title}
Difficulty: ${difficulty}
Target Language: ${language}

Description:
${description}

User Code (if any):
${userCode || "Not provided"}
`.trim()
        }
      ]
    }
  ];
};