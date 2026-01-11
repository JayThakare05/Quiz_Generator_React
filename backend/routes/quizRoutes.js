import express from "express";
import multer from "multer";
import axios from "axios";

const router = express.Router();

/* ---------- MULTER CONFIG ---------- */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"));
    }
  }
});

/* ---------- GENERATE QUIZ ---------- */
router.post("/generate", upload.single("pdf"), async (req, res) => {
    console.log("Done")
  try {
    const {
      difficulty,
      numQuestions,
      pageMode,
      startPage,
      endPage
    } = req.body;

    const pdfPath = req.file.path;
    console.log(pdfPath)

    // 🔗 CALL PYTHON AI SERVICE
    const aiResponse = await axios.post(
      "http://localhost:8000/generate-quiz",
      {
        pdf_path: pdfPath,
        difficulty: difficulty,
        num_questions: Number(numQuestions),
        page_mode: pageMode,
        start_page: startPage ? Number(startPage) : null,
        end_page: endPage ? Number(endPage) : null
      }
    );

    res.json({
      success: true,
      quiz: aiResponse.data.questions
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      error: "Quiz generation failed"
    });
  }
});

export default router;
