import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_file, page_mode="Full PDF", start_page=None, end_page=None):
    """
    Extract text from a PDF file.
    Supports full PDF or custom page range.
    Page numbers are 1-based for user input.
    """

    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    total_pages = doc.page_count
    extracted_text = ""

    if page_mode == "Full PDF":
        page_range = range(total_pages)
    else:
        # Convert to 0-based indexing safely
        start = max((start_page or 1) - 1, 0)
        end = min(end_page or total_pages, total_pages)
        page_range = range(start, end)

    for page_num in page_range:
        page = doc.load_page(page_num)
        extracted_text += page.get_text()

    doc.close()
    return extracted_text
