import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import router from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10
});

app.use("/", limiter, router);

app.post("/debug", (req, res) => {
  console.log("HEADERS:", req.headers["content-type"]);
  console.log("BODY:", req.body);

  res.json({
    body: req.body,
    type: typeof req.body
  });
}); 

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});