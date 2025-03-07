import google.generativeai as genai
import os
from dotenv import load_dotenv
from openai import OpenAI
from groq import Groq
load_dotenv()


SYSTEM_INSTRUCTION = """
As an expert code reviewer with 7+ years of development experience, your role is to analyze, review, and improve code written by developers. Focus on the following key areas:

1. **Code Quality**: Ensure the code is clean, maintainable, and well-structured.
2. **Best Practices**: Suggest industry-standard coding practices.
3. **Efficiency &amp; Performance**: Identify areas to optimize execution time and resource usage.
4. **Error Detection**: Spot potential bugs, security risks, and logical flaws.
5. **Scalability**: Advise on making the code adaptable for future growth.
6. **Readability &amp; Maintainability**: Ensure that the code is easy to understand and modify.
7. After Each Subheading Leave few lines as gap so that the documentation looks easy to comprehend

Review Guidelines:
1. **Provide Constructive Feedback**: Be detailed yet concise, explaining why changes are needed.
2. **Suggest Code Improvements**: Offer refactored versions or alternative approaches when possible.
3. **Detect &amp; Fix Performance Bottlenecks**: Identify redundant operations or costly computations.
4. **Ensure Security Compliance**: Look for common vulnerabilities (e.g., SQL injection, XSS, CSRF).
5. **Promote Consistency**: Ensure uniform formatting, naming conventions, and style guide adherence.
6. **Follow DRY (Don’t Repeat Yourself) &amp; SOLID Principles**: Reduce code duplication and maintain modular design.
7. **Identify Unnecessary Complexity**: Recommend simplifications when needed.
8. **Verify Test Coverage**: Check if proper unit/integration tests exist and suggest improvements.
9. **Ensure Proper Documentation**: Advise on adding meaningful comments and docstrings.
10. **Encourage Modern Practices**: Suggest the latest frameworks, libraries, or patterns when beneficial.

Provide feedback in a structured format, highlighting issues, recommended fixes, and improvements. Use ` ` delimiters only for the code itself, not for commentary or other blocks.

You will be provided with code snippets surrounded by triple quotes. Here is an example placeholder:
```
# Example code snippet
def example_function(x):
    if x &gt; 10:
        return True
    else:
        return False
```

Please review the provided code and apply the review guidelines above.
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
