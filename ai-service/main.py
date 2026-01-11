from fastapi import FastAPI
from pydantic import BaseModel
import os
import json
from pdf_utils import extract_text_from_pdf
from chunking import chunk_text
from vector_store import create_vector_db
from quiz_generator import generate_quiz
# from quiz_parser import parse_quiz

app = FastAPI(title="AI Quiz Generator Service")

# ---------- REQUEST MODEL ----------
class QuizRequest(BaseModel):
    pdf_path: str
    difficulty: str
    num_questions: int
    page_mode: str
    start_page: int | None = None
    end_page: int | None = None


# ---------- API ----------
@app.post("/generate-quiz")
def generate_quiz_api(data: QuizRequest):
    print(data)
    data.pdf_path=f"../backend/{data.pdf_path}"
    if not os.path.exists(data.pdf_path):
        return {"error": "PDF not found"}
    print(data.pdf_path)
    
    print(data.pdf_path)
    # 1. Extract text
    with open(data.pdf_path, "rb") as f:
        print("yes")
        pdf_text = extract_text_from_pdf(
            f,
            page_mode=data.page_mode,
            start_page=data.start_page,
            end_page=data.end_page
        )
        # print(pdf_text)

    if not pdf_text.strip():
        return {"error": "No text extracted"}

    # 2. Chunking
    chunks = chunk_text(pdf_text)

    # 3. Vector DB (isolated per PDF)
    pdf_name = os.path.basename(data.pdf_path)
    db = create_vector_db(chunks, pdf_name)


    # 4. Retrieve relevant chunks
    docs = db.similarity_search(
        f"{data.difficulty} level quiz questions",
        k=6
    )
    context = "\n".join(d.page_content for d in docs)

    # 5. Generate quiz
   # 5. Generate quiz (with retry if less questions)
    MAX_RETRIES = 3
    attempt = 0
    all_questions = []

    while attempt < MAX_RETRIES and len(all_questions) < data.num_questions:
        raw_output = generate_quiz(
            context,
            data.difficulty,
            data.num_questions - len(all_questions)
        )

        try:
            quiz_json = json.loads(raw_output)
        except json.JSONDecodeError:
            attempt += 1
            continue

        if "questions" in quiz_json:
            all_questions.extend(quiz_json["questions"])

        attempt += 1

    # Final validation
    if len(all_questions) < data.num_questions:
        return {
            "success": False,
            "error": f"Only generated {len(all_questions)} questions after {MAX_RETRIES} retries"
        }

    return {
        "success": True,
        "questions": all_questions[:data.num_questions]
    }
