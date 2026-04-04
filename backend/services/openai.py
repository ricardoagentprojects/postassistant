# OpenAI integration for content generation
import logging
import os
import re
from typing import Dict, List, Optional

from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


def _openai_client() -> Optional[AsyncOpenAI]:
    key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not key:
        return None
    return AsyncOpenAI(api_key=key)

# Platform-specific prompts
PLATFORM_PROMPTS = {
    "twitter": {
        "post": "Write a Twitter post about {topic} with a {tone} tone. Length: {length}. Include relevant hashtags. {emoji_instruction}",
        "thread": "Write a Twitter thread (3-5 tweets) about {topic} with a {tone} tone. Each tweet should flow naturally to the next. Include relevant hashtags. {emoji_instruction}",
    },
    "instagram": {
        "post": "Write an Instagram caption about {topic} with a {tone} tone. Length: {length}. Include relevant hashtags. {emoji_instruction}",
        "story": "Write Instagram story text (short, engaging) about {topic} with a {tone} tone. {emoji_instruction}",
        "reel": "Write text for an Instagram Reel about {topic} with a {tone} tone. Should be catchy and engaging. {emoji_instruction}",
    },
    "linkedin": {
        "post": "Write a LinkedIn post about {topic} with a professional {tone} tone. Length: {length}. Should be insightful and valuable for professionals. {emoji_instruction}",
    }
}

# Length guidelines
LENGTH_GUIDELINES = {
    "twitter": {
        "short": "50-100 characters",
        "medium": "100-200 characters", 
        "long": "200-280 characters"
    },
    "instagram": {
        "short": "50-150 characters",
        "medium": "150-300 characters",
        "long": "300-500 characters"
    },
    "linkedin": {
        "short": "100-300 characters",
        "medium": "300-600 characters",
        "long": "600-1000 characters"
    }
}

async def generate_content(
    platform: str,
    content_type: str,
    topic: str,
    tone: str = "professional",
    length: str = "medium",
    hashtags: Optional[List[str]] = None,
    include_emojis: bool = True
) -> Dict:
    """
    Generate social media content using OpenAI
    """
    # Get platform-specific prompt template
    if platform not in PLATFORM_PROMPTS:
        raise ValueError(f"Unsupported platform: {platform}")
    
    if content_type not in PLATFORM_PROMPTS[platform]:
        raise ValueError(f"Unsupported content type for {platform}: {content_type}")
    
    prompt_template = PLATFORM_PROMPTS[platform][content_type]
    
    # Prepare prompt variables
    emoji_instruction = "Include relevant emojis to make it engaging." if include_emojis else "Do not include emojis."
    length_description = LENGTH_GUIDELINES.get(platform, {}).get(length, "medium length")
    
    # Format prompt
    prompt = prompt_template.format(
        topic=topic,
        tone=tone,
        length=length_description,
        emoji_instruction=emoji_instruction
    )
    
    # Add hashtag instructions if provided
    if hashtags:
        hashtag_text = " ".join([f"#{tag.replace(' ', '')}" for tag in hashtags])
        prompt += f"\n\nInclude these hashtags: {hashtag_text}"
    
    # System message for context
    system_message = f"""You are a social media content expert specializing in {platform} content.
    Create engaging, authentic content that resonates with the target audience.
    Follow platform best practices and guidelines.
    The content should be ready to post - no markdown, just plain text."""
    
    client = _openai_client()
    if client is None:
        logger.info("OPENAI_API_KEY not set; using mock content generator")
        return get_mock_content(platform, content_type, topic, tone, hashtags)

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",  # Can upgrade to gpt-4 later
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
        )
        
        content = response.choices[0].message.content.strip()
        
        # Extract hashtags from content if not provided
        if not hashtags:
            # Simple hashtag extraction (words starting with #)
            extracted_hashtags = [word[1:] for word in content.split() if word.startswith("#")]
            hashtags = extracted_hashtags
        
        return {
            "content": content,
            "model": response.model,
            "prompt_tokens": response.usage.prompt_tokens if response.usage else None,
            "completion_tokens": response.usage.completion_tokens if response.usage else None,
            "total_tokens": response.usage.total_tokens if response.usage else None,
            "hashtags": hashtags,
            "platform": platform,
            "content_type": content_type
        }
        
    except Exception as e:
        logger.warning("OpenAI request failed, falling back to mock: %s", e, exc_info=True)
        return get_mock_content(platform, content_type, topic, tone, hashtags)

def get_mock_content(
    platform: str,
    content_type: str,
    topic: str,
    tone: str,
    hashtags: Optional[List[str]] = None
) -> Dict:
    """Mock content for development/testing"""
    mock_contents = {
        "twitter": {
            "post": f"🚀 Exciting news about {topic}! This is a {tone} Twitter post. #innovation #tech",
            "thread": f"1/ Thread about {topic}:\n\nFirst tweet with {tone} tone.\n\n2/ Second tweet continuing the discussion.\n\n3/ Final thoughts on {topic}. #thread #discussion",
        },
        "instagram": {
            "post": f"✨ Sharing thoughts on {topic} with a {tone} vibe.\n\nWhat are your thoughts? 👇\n\n#inspiration #ideas",
            "story": f"Quick update: Exploring {topic} today! 💭\n\nSwipe up for more! 👆",
            "reel": f"🎬 Reel about {topic}!\n\n{('#' + ' #'.join(hashtags)) if hashtags else '#content #creation'}",
        },
        "linkedin": {
            "post": f"Professional insights on {topic}. As we navigate this space, key considerations include...\n\n#professional #business #strategy",
        }
    }
    
    content = mock_contents.get(platform, {}).get(
        content_type, 
        f"Content about {topic} for {platform} ({content_type}) with {tone} tone."
    )
    
    return {
        "content": content,
        "model": "mock-gpt-3.5",
        "prompt_tokens": 50,
        "completion_tokens": 100,
        "total_tokens": 150,
        "hashtags": hashtags or ["mock", "development", platform],
        "platform": platform,
        "content_type": content_type
    }

async def analyze_content_engagement(
    content: str,
    platform: str
) -> Dict:
    """
    Analyze content for potential engagement (mock for now)
    """
    # This would use NLP to analyze sentiment, readability, etc.
    # For now, return mock analysis
    
    return {
        "sentiment_score": 0.8,  # 0-1 scale
        "readability_score": 0.7,  # 0-1 scale
        "engagement_potential": "high",  # low, medium, high
        "recommended_improvements": [
            "Add more specific examples",
            "Include a call-to-action",
            "Consider adding relevant statistics"
        ],
        "optimal_posting_times": ["09:00", "12:00", "17:00"]  # Platform-specific
    }

def _mock_variations(base_content: str, platform: str, num_variations: int) -> List[Dict]:
    tones = ["casual", "professional", "enthusiastic"]
    return [
        {
            "content": f"{base_content}\n\n— Alt. {i + 1} ({tones[i % 3]} angle for {platform})",
            "tone": tones[i % 3],
            "hashtags": [f"v{i + 1}", platform],
        }
        for i in range(num_variations)
    ]


async def generate_content_variations(
    base_content: str,
    platform: str,
    num_variations: int = 3,
) -> List[Dict]:
    client = _openai_client()
    if client is None:
        return _mock_variations(base_content, platform, num_variations)

    try:
        prompt = (
            f"Platform: {platform}\n\nOriginal post:\n{base_content}\n\n"
            f"Write exactly {num_variations} clearly different alternative versions. "
            "Number each 1. 2. 3. etc. Keep each ready to post (plain text, no markdown headers)."
        )
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You rewrite social posts for clarity and engagement. Follow the numbering format.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.85,
            max_tokens=900,
        )
        text = (response.choices[0].message.content or "").strip()
        parts = []
        blocks = re.split(r"\n\s*(?=\d+\.\s)", text)
        for block in blocks:
            block = block.strip()
            if not block:
                continue
            cleaned = re.sub(r"^\d+\.\s*", "", block, count=1).strip()
            if cleaned:
                parts.append({"content": cleaned, "tone": None, "hashtags": []})
        if len(parts) >= num_variations:
            return parts[:num_variations]
        if len(parts) > 0:
            return parts
    except Exception as e:
        logger.warning("Variation generation failed, using mock: %s", e, exc_info=True)

    return _mock_variations(base_content, platform, num_variations)


async def refine_content(
    text: str,
    instruction: str,
    platform: str,
) -> Dict:
    """Apply user instruction to improve or adjust copy."""
    client = _openai_client()
    if client is None:
        return {
            "content": f"{text}\n\n[Adjusted: {instruction}]",
            "model": "mock-refine",
        }

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": f"You edit {platform} social copy. Output only the final post text, no quotes.",
                },
                {
                    "role": "user",
                    "content": f"Original:\n{text}\n\nInstruction:\n{instruction}",
                },
            ],
            temperature=0.6,
            max_tokens=600,
        )
        out = (response.choices[0].message.content or "").strip()
        return {"content": out, "model": response.model}
    except Exception as e:
        logger.warning("Refine failed, returning stitched mock: %s", e, exc_info=True)
        return {
            "content": f"{text}\n\n[Adjusted: {instruction}]",
            "model": "mock-refine",
        }