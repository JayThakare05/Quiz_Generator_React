from langchain_ollama import OllamaLLM
import json

def generate_quiz(context, difficulty, num_questions):
    llm = OllamaLLM(model="llama3")

    prompt = f"""
You are an API that returns ONLY valid JSON.
Do NOT include explanations, markdown, or extra text.

Return JSON in this EXACT structure:

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
      "correct": "A"
    }}
  ]
}}

Rules:
- Return EXACTLY {num_questions} questions
- Difficulty: {difficulty}
- Correct must be one of A/B/C/D
- Use ONLY the content below
- Output must be VALID JSON

CONTENT:
{context}
"""

    response = llm.invoke(prompt)
    return response