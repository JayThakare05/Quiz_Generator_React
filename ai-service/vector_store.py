from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings

import os
import shutil
import hashlib


BASE_VECTOR_DB = "vector_db"


def _safe_pdf_name(pdf_name: str) -> str:
    """
    Create a safe, unique folder name for each PDF
    """
    name_hash = hashlib.md5(pdf_name.encode()).hexdigest()
    clean_name = pdf_name.replace(" ", "_").replace(".pdf", "")
    return f"{clean_name}_{name_hash[:8]}"


def create_vector_db(chunks, pdf_name):
    """
    Create a fresh vector DB for a given PDF
    """

    os.makedirs(BASE_VECTOR_DB, exist_ok=True)

    db_folder = _safe_pdf_name(pdf_name)
    db_path = os.path.join(BASE_VECTOR_DB, db_folder)

    # Remove old DB if same PDF is re-uploaded
    if os.path.exists(db_path):
        shutil.rmtree(db_path)

    embeddings = OllamaEmbeddings(model="nomic-embed-text")

    db = Chroma.from_texts(
        texts=chunks,
        embedding=embeddings,
        persist_directory=db_path
    )

    return db
