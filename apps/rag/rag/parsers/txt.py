"""Plain text — decode utf-8."""
# TODO: def extract_text_from_txt(bytes) -> str

def extract(bytes_content: bytes) -> str:
    return bytes_content.decode("utf-8", errors="replace")
