from groq import Groq
from core.config import settings

client = Groq(api_key=settings.groq_api_key)

def call_groq(prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful academic assistant for the CS department at BITS Goa. "
                    "Answer questions using only the provided context. "
                    "If the context does not contain enough information, say so clearly. "
                    "Always be concise and accurate."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=1024,
    )
    return response.choices[0].message.content.strip()