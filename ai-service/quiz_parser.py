import re

def parse_quiz(text):
    print("RAW TEXT:", text)

    pattern = r"""
    (?:Q\d+\.?|^\d+\.?)?\s*(.*?)
    [\r\n]+
    A[\).\:\-]\s*(.*?)
    [\r\n]+
    B[\).\:\-]\s*(.*?)
    [\r\n]+
    C[\).\:\-]\s*(.*?)
    [\r\n]+
    D[\).\:\-]\s*(.*?)
    [\r\n]+
    Correct\s*Answer.*?([A-D])
    """

    matches = re.findall(
        pattern,
        text,
        re.DOTALL | re.VERBOSE | re.IGNORECASE
    )

    print("MATCHES:", matches)

    questions = []
    for q, a, b, c, d, correct in matches:
        questions.append({
            "question": q.strip(),
            "options": {
                "A": a.strip(),
                "B": b.strip(),
                "C": c.strip(),
                "D": d.strip()
            },
            "correct": correct.upper()
        })

    return questions
