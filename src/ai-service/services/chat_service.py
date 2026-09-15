"""
chat_service.py — IBM Bob call for AI Eco Mentor interactive chat.
"""
import json
import logging
import os
import re
import requests
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

_DEFAULT_MODEL = "ibm/granite-3-8b-instruct"

ZERO_WASTE_TIPS = [
    {"title": "Carry Reusables", "desc": "Use stainless steel water bottles and cloth shopping bags daily."},
    {"title": "Say No to Single-Use Plastics", "desc": "Avoid plastic straws, disposable cutlery, and bottled drinks."},
    {"title": "Segregate Waste at Source", "desc": "Keep paper & plastic recyclables separate from wet kitchen waste."},
    {"title": "Compost Organic Scraps", "desc": "Turn fruit peels and vegetable scraps into nutrient-rich garden soil."},
    {"title": "Repurpose & Upcycle", "desc": "Reuse glass jars for storage and old t-shirts as cleaning rags."},
]

WATER_TIPS = [
    {"title": "Turn Off Running Taps", "desc": "Close the faucet while brushing teeth to save 6+ liters per minute."},
    {"title": "Fix Leaks Immediately", "desc": "A single dripping tap wastes 15+ liters of fresh water daily."},
    {"title": "Install Rainwater Harvesting", "desc": "Set up collection barrels at school and home to capture rain."},
    {"title": "Reuse RO Wastewater", "desc": "Collect reject water from purifiers to mop floors or water plants."},
]

ENERGY_TIPS = [
    {"title": "Switch to LED Bulbs", "desc": "LED lights consume up to 80% less electricity than traditional bulbs."},
    {"title": "Unplug Phantom Electronics", "desc": "Disconnect chargers when not in use to stop standby power draw."},
    {"title": "Maximize Natural Daylight", "desc": "Open curtains during the day instead of turning on lights."},
]

def _smart_eco_fallback(message: str) -> str:
    msg = message.lower().strip()
    
    if any(k in msg for k in ["topic", "recommend", "study", "next", "suggest", "what should"]):
        return (
            "Based on your performance analytics, here are your **AI Personalized Topic Recommendations**:\n\n"
            "1. 🎯 **Water Conservation** (Current Score: 55%) — *Top Recommendation*\n"
            "   Recommended Mission: **Water Saver** (+75 Eco Points)\n\n"
            "2. 📘 **Climate Change** (Current Score: 68%) — *Intermediate Priority*\n"
            "   Recommended Mission: **Carbon Footprint Tracker** (+100 Eco Points)\n\n"
            "3. 🏆 **Waste Management** (Current Score: 82%) — *Strong Area*\n"
            "   Recommended Mission: **Plastic-Free Week** (+100 Eco Points)\n\n"
            "💡 *Tip: Head to your Learn page to start the Water Saver lesson!*"
        )
    
    if any(k in msg for k in ["mission", "task", "challenge", "assignment"]):
        return (
            "Here are your top recommended **Green Missions** to complete today:\n\n"
            "1. 💧 **Water Saver**: Inspect faucets & log water savings (+75 Eco Points)\n"
            "2. ♻️ **Plastic-Free Week**: Avoid single-use plastics for 7 days (+100 Eco Points)\n"
            "3. 🌳 **Plant a Tree**: Plant a sapling & submit photo for AI verification (+200 Eco Points)"
        )

    if any(k in msg for k in ["waste", "plastic", "recycle", "trash", "zero"]):
        tips_str = "\n".join([f"{i+1}. **{t['title']}**: {t['desc']}" for i, t in enumerate(ZERO_WASTE_TIPS[:3])])
        return f"Here are practical zero-waste actions you can take today:\n\n{tips_str}\n\n♻️ *Every item kept out of landfills protects our oceans!*"

    if any(k in msg for k in ["water", "rain", "conserve", "tap", "leak"]):
        tips_str = "\n".join([f"{i+1}. **{t['title']}**: {t['desc']}" for i, t in enumerate(WATER_TIPS[:3])])
        return f"Here are essential water conservation tips:\n\n{tips_str}\n\n💧 *Protect every drop!*"

    if any(k in msg for k in ["energy", "electricity", "power", "solar", "bulb"]):
        tips_str = "\n".join([f"{i+1}. **{t['title']}**: {t['desc']}" for i, t in enumerate(ENERGY_TIPS[:3])])
        return f"Here are key energy-saving actions:\n\n{tips_str}\n\n⚡ *Save power, protect the planet!*"

    if any(k in msg for k in ["climate", "warming", "co2", "carbon", "temperature"]):
        return (
            "Global warming happens when greenhouse gases like Carbon Dioxide (CO2) trap heat in our atmosphere. "
            "To combat climate change:\n\n"
            "1. **Use Green Transport**: Walk, cycle, or take public transit for short trips.\n"
            "2. **Reduce Power Consumption**: Switch off unused lights and appliances.\n"
            "3. **Plant Native Trees**: Trees absorb CO2 and release clean oxygen!\n\n"
            "🌍 Every small habit makes a big difference!"
        )

    if any(k in msg for k in ["hi", "hello", "hey", "greetings"]):
        return "Hello Eco Warrior! 🌿 I am your AI Eco Mentor. Ask me about **topic recommendations**, **green missions**, **recycling**, or **climate action**!"

    return (
        f"Great question about '{message}'! Environmental sustainability relies on conscious daily choices to preserve natural resources.\n\n"
        "Try asking me: *'Give me topic recommendations'*, *'What missions should I do?'*, or *'How can I save water at school?'*"
    )


def get_chat_reply(message: str) -> str:
    """
    Call IBM Bob to answer student questions. Falls back to smart responder if Bob fails.
    """
    api_key = os.environ.get("BOB_API_KEY", "")
    project_id = os.environ.get("WATSONX_PROJECT_ID", "")
    url = os.environ.get("BOB_API_ENDPOINT", "https://us-south.ml.cloud.ibm.com")
    model_id = os.environ.get("WATSONX_MODEL_ID", _DEFAULT_MODEL)

    prompt = (
        "You are an AI Eco Mentor for school students on GenGreen, an environmental education platform.\n"
        "Answer the student question encouragingly, concisely (2-4 sentences), and with accurate facts.\n\n"
        f"Student Question: {message}\n\n"
        "Your Response:"
    )

    if api_key:
        try:
            body: dict = {
                "model_id": model_id,
                "input": prompt,
                "parameters": {"max_new_tokens": 250},
            }
            if project_id and project_id != "your_project_id_here":
                body["project_id"] = project_id
            response = requests.post(
                f"{url}/ml/v1/text/generation?version=2023-05-29",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=body,
                timeout=15,
            )
            response.raise_for_status()
            raw_text = response.json()["results"][0]["generated_text"].strip()
            if raw_text:
                return raw_text
        except Exception as exc:
            logger.warning("IBM Bob chat call failed: %s — using smart fallback", exc)

    return _smart_eco_fallback(message)
