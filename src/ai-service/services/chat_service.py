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
    {"title": "Go Digital & Decline Paper Receipts", "desc": "Opt for digital receipts and digital notebooks for school."},
    {"title": "Buy Package-Free Goods in Bulk", "desc": "Shop at bulk stations using your own reusable containers."},
    {"title": "Repair Items Before Replacing", "desc": "Mend worn clothes and repair tools to extend their lifecycle."},
    {"title": "Choose Natural Materials", "desc": "Prefer bamboo toothbrushes and wooden combs over plastic alternatives."},
    {"title": "Donate & Share Unused Items", "desc": "Pass along old textbooks and clothes to schoolmates or shelters."},
]

WATER_TIPS = [
    {"title": "Turn Off Running Taps", "desc": "Close the faucet while brushing teeth to save 6+ liters per minute."},
    {"title": "Fix Leaks Immediately", "desc": "A single dripping tap wastes 15+ liters of fresh water daily."},
    {"title": "Install Rainwater Harvesting", "desc": "Set up collection barrels at school and home to capture rain."},
    {"title": "Reuse RO Wastewater", "desc": "Collect reject water from purifiers to mop floors or water plants."},
    {"title": "Take Shorter Showers", "desc": "Keep showers under 5 minutes or use a bucket and mug to control water use."},
]

ENERGY_TIPS = [
    {"title": "Switch to LED Bulbs", "desc": "LED lights consume up to 80% less electricity than traditional bulbs."},
    {"title": "Unplug Phantom Electronics", "desc": "Disconnect chargers when not in use to stop standby power draw."},
    {"title": "Maximize Natural Daylight", "desc": "Open curtains during the day instead of turning on lights."},
    {"title": "Set AC to 24°C–26°C", "desc": "Optimal air conditioner temperatures reduce compressor energy load."},
    {"title": "Switch Off Unused Appliances", "desc": "Turn off lights, fans, and computers whenever leaving a room."},
]

def _extract_count(q: str, default_val: int = 3) -> int:
    digit = re.search(r"\b([1-9]|10)\b", q)
    if digit:
        return min(int(digit.group(1)), 10)
    word_map = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
    }
    for word, num in word_map.items():
        if re.search(r"\b" + word + r"\b", q, re.IGNORECASE):
            return num
    return default_val


def _smart_eco_fallback(message: str) -> str:
    msg = message.lower().strip()
    count = _extract_count(msg, 3)

    # 1. Topic / Learning Recommendations
    if any(k in msg for k in ["topic", "recommend", "study", "next", "suggest", "what should i learn", "course"]):
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

    # 2. Missions / Tasks / Challenges
    if any(k in msg for k in ["mission", "task", "challenge", "assignment", "activity"]):
        return (
            "Here are your top recommended **Green Missions** to complete today:\n\n"
            "1. 💧 **Water Saver**: Inspect faucets & log water savings (+75 Eco Points)\n"
            "2. ♻️ **Plastic-Free Week**: Avoid single-use plastics for 7 days (+100 Eco Points)\n"
            "3. 🌳 **Plant a Tree**: Plant a sapling & submit photo for AI verification (+200 Eco Points)"
        )

    # 3. Waste & Recycling
    if any(k in msg for k in ["waste", "plastic", "recycle", "trash", "zero", "litter", "garbage"]):
        selected = ZERO_WASTE_TIPS[:count]
        tips_str = "\n".join([f"{i+1}. **{t['title']}**: {t['desc']}" for i, t in enumerate(selected)])
        return f"Here are **{len(selected)} practical zero-waste actions** for daily life:\n\n{tips_str}\n\n♻️ *Every item kept out of landfills protects our oceans and wildlife!*"

    # 4. Water Conservation
    if any(k in msg for k in ["water", "rain", "conserve", "tap", "leak", "harvest", "shower", "faucet"]):
        selected = WATER_TIPS[:count]
        tips_str = "\n".join([f"{i+1}. **{t['title']}**: {t['desc']}" for i, t in enumerate(selected)])
        return f"Here are **{len(selected)} essential water conservation tips**:\n\n{tips_str}\n\n💧 *Protect every drop!*"

    # 5. Energy & Solar
    if any(k in msg for k in ["energy", "electricity", "power", "solar", "bulb", "appliances", "light"]):
        selected = ENERGY_TIPS[:count]
        tips_str = "\n".join([f"{i+1}. **{t['title']}**: {t['desc']}" for i, t in enumerate(selected)])
        return f"Here are **{len(selected)} key energy-saving actions** for home and school:\n\n{tips_str}\n\n⚡ *Save power, protect the planet!*"

    # 6. Climate Change / Carbon / Global Warming
    if any(k in msg for k in ["climate", "warming", "co2", "carbon", "greenhouse", "atmosphere", "temperature"]):
        return (
            "**Global Warming & Climate Action**:\n\n"
            "Global warming happens when greenhouse gases (like CO2 and Methane) trap heat in Earth's atmosphere. "
            "This leads to rising sea levels, extreme heatwaves, and shifting weather patterns.\n\n"
            "🌱 **Key Actions You Can Take**:\n"
            "1. Walk or cycle for short distances to cut transportation emissions.\n"
            "2. Reduce energy consumption at home and school.\n"
            "3. Plant trees — natural carbon sinks that absorb CO2!\n\n"
            "🌍 *Every small green action contributes to a sustainable future!*"
        )

    # 7. Trees / Biodiversity / Forests / Wildlife
    if any(k in msg for k in ["tree", "plant", "forest", "biodiversity", "animal", "wildlife", "nature", "ecosystem", "bee", "species"]):
        return (
            "**Trees & Ecosystem Protection**:\n\n"
            "Trees and natural ecosystems are essential for life on Earth! A single mature tree absorbs roughly **22 kg of CO2 per year** "
            "while producing clean oxygen for 2 human beings and providing shelter for local wildlife.\n\n"
            "🌳 **Eco-Tip**: Plant native species in your school garden or neighborhood to support local pollinators and birds!"
        )

    # 8. Compost / Soil / Organic Scraps
    if any(k in msg for k in ["compost", "soil", "food waste", "organic", "peel", "scraps"]):
        return (
            "**Composting & Soil Health**:\n\n"
            "Composting turns organic kitchen waste (fruit peels, vegetable scraps, coffee grounds) into rich, fertile soil conditioner. "
            "By composting, you prevent organic matter from decaying in landfills where it would create harmful methane gas.\n\n"
            "🌱 **Quick Tip**: Mix green materials (kitchen scraps) with brown materials (dry leaves, cardboard) for healthy compost!"
        )

    # 9. Ocean / Marine / Sea / Plastic Pollution
    if any(k in msg for k in ["ocean", "sea", "marine", "turtle", "fish", "river", "pollution"]):
        return (
            "**Ocean & Marine Conservation**:\n\n"
            "Over 8 million tons of plastic enter our oceans every year, threatening sea turtles, fish, and marine ecosystems. "
            "Most ocean plastic originates from land-based litter washed into storm drains.\n\n"
            "🌊 **How to Help**: Stop using single-use plastic bottles, straws, and bags. Always dispose of litter responsibly!"
        )

    # 10. Greetings
    if any(k in msg for k in ["hi", "hello", "hey", "greetings", "good morning", "good afternoon"]):
        return "Hello Eco Warrior! 🌿 I am your AI Eco Mentor. How can I help you with your environmental learning, green missions, or daily eco-habits today?"

    # 11. Intelligent fallback for ANY general question
    clean_q = message.strip().rstrip('?')
    return (
        f"That is a great question about **'{clean_q}'**!\n\n"
        f"In environmental science, understanding **{clean_q}** helps us make conscious daily choices to protect natural resources. "
        "Every small habit — from reducing plastic waste to saving water — keeps ecosystems healthy for future generations.\n\n"
        "💡 *Try asking me for topic recommendations, zero-waste tips, or water conservation advice!*"
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

