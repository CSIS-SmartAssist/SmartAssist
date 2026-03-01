from groq import Groq
from core.config import settings
from datetime import datetime
import json

client = Groq(api_key=settings.groq_api_key)

BOOKING_TOOL = {
    "type": "function",
    "function": {
        "name": "create_booking",
        "description": "Create a room or lab booking request when the user explicitly asks to book a room or lab. Extract all booking details from the user message.",
        "parameters": {
            "type": "object",
            "properties": {
                "room_name": {
                    "type": "string",
                    "description": "The name of the room or lab to book e.g. LT1, LT2, A604"
                },
                "date": {
                    "type": "string",
                    "description": "The date of the booking in YYYY-MM-DD format. Today is " + datetime.now().strftime("%Y-%m-%d")
                },
                "start_time": {
                    "type": "string",
                    "description": "Start time in HH:MM 24-hour format e.g. 14:00"
                },
                "end_time": {
                    "type": "string",
                    "description": "End time in HH:MM 24-hour format e.g. 16:00"
                },
                "reason": {
                    "type": "string",
                    "description": "The reason or purpose for the booking"
                }
            },
            "required": ["room_name", "date", "start_time", "end_time", "reason"]
        }
    }
}


def call_groq(prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful academic assistant for the CS department at BITS Goa. "
                    "Answer questions using the provided context. "
                    "If the context is not enough, use your general knowledge. "
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


def call_groq_with_tools(message: str, rooms: list[dict]) -> dict:
    rooms_text = "\n".join([
        f"- {r['name']} (ID: {r['id']}, Location: {r['location']}, Capacity: {r['capacity']})"
        for r in rooms
    ])
    room_names = [r["name"] for r in rooms]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    f"You are a helpful academic assistant for the CS department at BITS Goa.\n"
                    f"Today's date is {datetime.now().strftime('%A, %B %d, %Y')}.\n"
                    f"Available rooms:\n{rooms_text}\n\n"
                    f"If the user wants to book a room, use the create_booking tool.\n"
                    f"Only use the tool if the user is clearly asking to make a booking.\n"
                    f"For questions and general queries, just answer normally."
                )
            },
            {
                "role": "user",
                "content": message
            }
        ],
        tools=[BOOKING_TOOL],
        tool_choice="auto",
        temperature=0.2,
        max_tokens=1024,
    )

    choice = response.choices[0]

    if choice.finish_reason == "tool_calls" and choice.message.tool_calls:
        tool_call = choice.message.tool_calls[0]
        if tool_call.function.name == "create_booking":
            params = json.loads(tool_call.function.arguments)

            # Check which required fields are missing or empty
            required = ["room_name", "date", "start_time", "end_time", "reason"]
            missing = [f for f in required if not params.get(f)]

            # Detect fabricated times — if user never mentioned a time, mark as missing
            time_words = ["am", "pm", ":", "o'clock", "morning", "afternoon", "evening"]
            time_mentioned = any(word in message.lower() for word in time_words)
            if not time_mentioned:
                if "start_time" not in missing:
                    missing.append("start_time")
                if "end_time" not in missing:
                    missing.append("end_time")

            # Detect fabricated dates — if user never mentioned a date, mark as missing
            date_words = [
                "today", "tomorrow", "monday", "tuesday", "wednesday",
                "thursday", "friday", "saturday", "sunday",
                "jan", "feb", "mar", "apr", "may", "jun",
                "jul", "aug", "sep", "oct", "nov", "dec",
                "/", "-", "next", "this"
            ]
            date_mentioned = any(word in message.lower() for word in date_words)
            if not date_mentioned and "date" not in missing:
                missing.append("date")

            if missing:
                missing_labels = {
                    "room_name": "which room or lab",
                    "date": "which date",
                    "start_time": "what start time",
                    "end_time": "what end time",
                    "reason": "the reason or purpose"
                }
                missing_text = ", ".join([missing_labels[f] for f in missing])
                return {
                    "type": "booking_incomplete",
                    "params": params,
                    "missing": missing,
                    "answer": (
                        f"I'd love to help you book a room! Could you tell me {missing_text}? "
                        f"Available rooms are: {', '.join(room_names)}."
                    )
                }

            return {
                "type": "booking_request",
                "params": params
            }

    # Normal text response
    return {
        "type": "text",
        "answer": choice.message.content.strip() if choice.message.content else "I'm not sure how to help with that."
    }