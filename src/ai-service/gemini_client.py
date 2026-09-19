"""Shared Gemini API client for GenGreen's AI explanation features."""

import os

from google import genai
from google.genai import types


_DEFAULT_MODEL = "gemini-2.5-flash-lite"


def generate_text(prompt: str, response_schema: dict | None = None) -> str:
    """Generate text, optionally constrained to a JSON schema."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    if response_schema is not None:
        config = types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json",
            response_schema=response_schema,
        )
    else:
        config = types.GenerateContentConfig(temperature=0.2)

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", _DEFAULT_MODEL),
        contents=prompt,
        config=config,
    )
    text = (response.text or "").strip()
    if not text:
        raise RuntimeError("Gemini returned an empty response")
    return text
