from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from google import genai


app = FastAPI()

load_dotenv()

# Allow requests from any origin while developing locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate Gemini model once at startup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client  = genai.Client(api_key=GEMINI_API_KEY)

class Prompt(BaseModel):
    prompt: str


@app.post("/api/layout")
async def layout(p: Prompt):
    """The following is a user prompt to create the bricks in an LLM-powered version of breakout.
    This prompt is describing the theme of the content they want. I.E. Your bricks will describe 
    a short story, or short paragraph about the prompt that has been provided. Ensure the
    length of your output is approximately 75 words or less."""
    try:
        resp = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"The following is a user prompt to create the bricks in an LLM-powered version of breakout.
    This prompt is describing the theme of the content they want. I.E. Your bricks will describe 
    a short story, or short paragraph about the prompt that has been provided. Ensure the
    length of your output is approximately 75 words or less. The prompt is: {p.prompt}"
        )
        paragraph = resp.text
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {"paragraph": paragraph} 