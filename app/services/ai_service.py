import google.generativeai as genai
import os
from dotenv import load_dotenv
from openai import OpenAI
from groq import Groq
load_dotenv()


SYSTEM_INSTRUCTION = """
you are an AI chatBot who helps people in giving code and solving their problems, your response will be directly shown int the text,
so give response like a chat. Also Explain the modifications done. if the code is correct just say its correct and give small explanation of the program.

If the user asks a programming-related question instead of providing code for review, answer their question helpfully. If the user asks about non-programming topics (like weather, news, personal information, politics, entertainment), politely decline with: "I'm designed to help with programming and code-related questions. I can't provide information about [topic]. 
note:1) always keep the class in java code as Main
2)this uses judge0 so give code accordingly so that the compiler can run the code"
3) Your mission is to ensure every piece of code follows high standards. Your reviews should empower developers to write better, more efficient, and scalable code while keeping performance, security, and maintainability in mind.
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
        prompt = f"{SYSTEM_INSTRUCTION}\n\nUser question: {code}"
        response = gemni_model.generate_content([prompt])
        return response.text
    except Exception as e:
        print(f"Error in generating the review in Gemini: {e}")
        return "Failed to generate review in Gemini."


# Update the qwen_generate_review function to use streaming
async def qwen_generate_review(code: str) -> str:
    """Calls Qwen API to analyze and review code."""

    # GEMINI
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if not GROQ_API_KEY:
        raise ValueError("GROQ API key is missing! Set GROQ_API_KEY as an environment variable.")

    client=Groq(api_key=GROQ_API_KEY)

    try:
        user_content = f"User question: {code}"
            
        response = client.chat.completions.create(
            messages = [
                {"role": "system", "content": SYSTEM_INSTRUCTION},
                {"role": "user", "content": user_content}
            ],
            model="qwen-2.5-coder-32b",
            stream=True
        )
        
        full_response = ""
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                full_response += chunk.choices[0].delta.content
        
        return full_response
    except Exception as e:
        print(f"Error in generating the review in Qwen: {e}")
        return "Failed to generate review in Qwen."

# Update the deepseek_generate_review function to use streaming
async def deepseek_generate_review(code: str) -> str:
    """Calls DeepSeek API to analyze and review code."""
    # DeepSeek
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
    if not DEEPSEEK_API_KEY:
        raise ValueError("Deepseek API key is missing!")

    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://openrouter.ai/api/v1")

    try:

        user_content = f"User question: {code}"
            
        response = client.chat.completions.create(
            model="deepseek/deepseek-r1:free",
            messages = [
                {"role": "system", "content": SYSTEM_INSTRUCTION},
                {"role": "user", "content": user_content}
            ],
            stream=True  # Enable streaming
        )
        
        full_response = ""
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                full_response += chunk.choices[0].delta.content
        
        return full_response
    except Exception as e:
        print(f"Error in generating the review in DeepSeek: {e}")
        return "Failed to generate review in DeepSeek."

# Add this function after the qwen_generate_review function

async def qwq_generate_review(code: str) -> str:
    """Calls QwQ openrouter API to analyze and review code."""
    
    # QwQ openrouter
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    if not OPENROUTER_API_KEY:
        raise ValueError("OpenRouter API key is missing! Set OPENROUTER_API_KEY as an environment variable.")

    client = OpenAI(api_key=OPENROUTER_API_KEY, base_url="https://openrouter.ai/api/v1")

    try:

        user_content = f"User question: {code}"
            
        response = client.chat.completions.create(
            model="anthropic/claude-3-opus:free",  # Using Claude 3 Opus via OpenRouter for QwQ
            messages = [
                {"role": "system", "content": SYSTEM_INSTRUCTION},
                {"role": "user", "content": user_content}
            ],
            stream=True  # Enable streaming for word-by-word response
        )
        
        # For streaming response
        full_response = ""
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                full_response += chunk.choices[0].delta.content
        
        return full_response
    except Exception as e:
        print(f"Error in generating the review in QwQ: {e}")
        return "Failed to generate review in QwQ."
