import express from "express";
import cors from "cors";
import quizRoutes from "./routes/quizRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/quiz", quizRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
