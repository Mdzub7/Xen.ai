import google.generativeai as genai
import os
from dotenv import load_dotenv
from openai import OpenAI
from groq import Groq
load_dotenv()


SYSTEM_INSTRUCTION = """
You are an expert code reviewer with 7+ years of development experience. Your role is to analyze, review, and improve code written by developers. You focus on:
    • Code Quality :- Ensuring clean, maintainable, and well-structured code.
    • Best Practices :- Suggesting industry-standard coding practices.
    • Efficiency & Performance :- Identifying areas to optimize execution time and resource usage.
    • Error Detection :- Spotting potential bugs, security risks, and logical flaws.
    • Scalability :- Advising on how to make code adaptable for future growth.
    • Readability & Maintainability :- Ensuring that the code is easy to understand and modify.

Guidelines for Review:
    1. Provide Constructive Feedback :- Be detailed yet concise, explaining why changes are needed.
    2. Suggest Code Improvements :- Offer refactored versions or alternative approaches when possible.
    3. Detect & Fix Performance Bottlenecks :- Identify redundant operations or costly computations.
    4. Ensure Security Compliance :- Look for common vulnerabilities (e.g., SQL injection, XSS, CSRF).
    5. Promote Consistency :- Ensure uniform formatting, naming conventions, and style guide adherence.
    6. Follow DRY (Don’t Repeat Yourself) & SOLID Principles :- Reduce code duplication and maintain modular design.
    7. Identify Unnecessary Complexity :- Recommend simplifications when needed.
    8. Verify Test Coverage :- Check if proper unit/integration tests exist and suggest improvements.
    9. Ensure Proper Documentation :- Advise on adding meaningful comments and docstrings.
    10. Encourage Modern Practices :- Suggest the latest frameworks, libraries, or patterns when beneficial.

Provide feedback in a structured format, highlighting issues, recommended fixes, and improvements.
"""



# Gemini function
async def gemini_generate_review(code: str) -> str:
    """Calls Gemini API to analyze and review code."""

    # GEMINI
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing! Set GEMINI_API_KEY as an environment variable.")

    genai.configure(api_key=GEMINI_API_KEY)
    gemni_model = genai.GenerativeModel("gemini-1.5-flash")


    try:
        prompt = f"{SYSTEM_INSTRUCTION}\n\nReview the following code:\n```python\n{code}\n```"
        # Use the correct gemni_model instance for generating review
        response = gemni_model.generate_content([prompt])
        return response.text
    except Exception as e:
        print(f"Error in generating the review in Gemini: {e}")
        return "Failed to generate review in Gemini."

# DeepSeek function
async def deepseek_generate_review(code: str) -> str:
    """Calls DeepSeek API to analyze and review code."""
    # DeepSeek
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
    if not DEEPSEEK_API_KEY:
        raise ValueError("Deepseek API key is missing!")

    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://openrouter.ai/api/v1")

    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-r1:free",
            messages = [
            {"role": "system", "content": SYSTEM_INSTRUCTION},
            {"role": "user", "content": f"Review the following code:\n```python\n{code}\n```"}
            ],
            stream=False
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in generating the review in DeepSeek: {e}")
        return "Failed to generate review in DeepSeek."


async def qwen_generate_review(code: str) -> str:
    """Calls Qwen API to analyze and review code."""

    # GEMINI
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if not GROQ_API_KEY:
        raise ValueError("GROQ API key is missing! Set GROQ_API_KEY as an environment variable.")

    client=Groq(api_key=GROQ_API_KEY)

    try:
        response = client.chat.completions.create(
            messages = [
            {"role": "system", "content": SYSTEM_INSTRUCTION},
            {"role": "user", "content": f"Review the following code:\n```python\n{code}\n```"}
            ],
            model="qwen-2.5-coder-32b",
            stream=False
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in generating the review in Qwen: {e}")
        return "Failed to generate review in Qwen."
