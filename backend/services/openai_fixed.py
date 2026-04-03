# OpenAI integration with guaranteed fallback
import os
from typing import Dict, List, Optional

def generate_content(
    platform: str,
    content_type: str,
    topic: str,
    tone: str = "professional",
    length: str = "medium",
    hashtags: Optional[List[str]] = None,
    include_emojis: bool = True
) -> Dict:
    """
    Generate social media content - ALWAYS returns mock for now
    """
    # Always return mock content until OpenAI is fixed
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