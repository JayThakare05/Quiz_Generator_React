from langchain_ollama import OllamaLLM
import json

def generate_quiz(context, difficulty, num_questions):
    llm = OllamaLLM(model="llama3")

    prompt = f"""
You are an educational assessment API.
You must return ONLY valid JSON. No extra text.

STRICT JSON FORMAT (do not change keys):

{{
  "questions": [
    {{
      "question": "string",
      "options": {{
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      }},
      "correct": "A",
      "explanation": "Short explanation (2–4 lines max)"
    }}
  ]
}}

Rules:
- Generate EXACTLY and Strictly {num_questions} questions
- Difficulty: {difficulty}
- Explanation must explain WHY the correct option is correct
- Explanation length: max 2–4 lines
- Do NOT include author names, publication dates, preface info, acknowledgements
- Do NOT include metadata-based questions
- Questions must test CONCEPTS, DEFINITIONS, or UNDERSTANDING
- Use ONLY the academic content below
- Output must be VALID JSON

ACADEMIC CONTENT:
{context}
"""

    return llm.invoke(prompt)
