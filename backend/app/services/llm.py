# backend/app/services/llm.py
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("❌ OPENAI_API_KEY not found in environment variables")

# Define client globally
client = OpenAI(api_key=api_key)

def ask_llm(prompt: str, history: list = None) -> str:
    system_prompt = """You are Recipe Genie, an expert AI chef assistant.

CRITICAL BEHAVIOR RULES:
1. FOOD & COOKING ONLY: Only answer questions about food, cooking, recipes, ingredients, kitchen techniques, meal planning, nutrition, food culture, and where to buy or find ingredients. Refuse everything else.
2. OFF-TOPIC REFUSAL: If the user asks about anything clearly unrelated to food or cooking, respond ONLY with: "I'm Recipe Genie, your cooking assistant! I can only help with food, recipes, and cooking questions. Ask me anything about cooking and I'll be happy to help! 🍳"
3. ANSWER DIRECTLY: Answer simple questions concisely without unnecessary elaboration.
4. RECIPES ONLY WHEN ASKED: Only provide full recipes when users explicitly ask for them.
5. BE CONVERSATIONAL: Maintain natural conversation flow.

RECIPE FORMAT — use ONLY when a recipe is explicitly requested:
[Short engaging intro]

📝 Ingredients
• ingredient 1
• ingredient 2

👨‍🍳 Instructions
1. Step one
2. Step two

💡 Tips & Notes
• tip 1

FORMATTING RULES:
- Never use markdown headers (##, ###)
- Use plain emojis (📝 👨‍🍳 💡) as section titles
- For cooking questions: answer directly and concisely, no full recipe unless asked
- For clarifications: answer the specific question only"""

    try:
        messages = [{"role": "system", "content": system_prompt}]
        if history:
            for msg in history[-10:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=800,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        # Return a clean error message without technical details
        error_msg = str(e)
        if "quota" in error_msg.lower() or "billing" in error_msg.lower():
            return "I apologize, but there's currently an issue with my recipe service. Please check your OpenAI API quota and billing details. In the meantime, you might want to check reliable cooking websites for recipe information."
        elif "rate limit" in error_msg.lower():
            return "I'm receiving too many requests right now. Please wait a moment and try again. For immediate help, consider checking cooking websites or recipe apps."
        else:
            return "I'm experiencing some technical difficulties at the moment. Please try again in a few moments or check online cooking resources for immediate assistance."