"""Simple in-process rate limit for AI endpoints (per user). Resets on process restart."""

import os
import time
from collections import deque
from threading import Lock
from typing import Deque, Dict

_lock = Lock()
_windows: Dict[int, Deque[float]] = {}


def assert_under_rate_limit(user_id: int) -> None:
    """Raises HTTPException 429 if user exceeds per-minute AI call budget."""
    from fastapi import HTTPException, status

    max_per_min = int(os.getenv("AI_CALLS_PER_USER_PER_MINUTE", "20"))
    if max_per_min <= 0:
        return

    now = time.monotonic()
    window = 60.0

    with _lock:
        dq = _windows.setdefault(user_id, deque())
        while dq and now - dq[0] > window:
            dq.popleft()
        if len(dq) >= max_per_min:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many AI requests. Please wait a minute and try again.",
            )
        dq.append(now)
