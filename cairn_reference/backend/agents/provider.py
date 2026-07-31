"""
LLM provider abstraction layer with automatic multi-provider fallback cascade.

Supports:
- Groq (super fast, llama-3.3-70b-versatile / llama-3.1-8b-instant)
- Gemini (Google OpenAI-compatible endpoint, gemini-2.0-flash)
- OpenRouter (google/gemini-2.0-flash-lite-001)
- Ollama (local)

Automatically cascades from primary -> secondary -> fallback if any API fails.
"""

from __future__ import annotations

import json
import logging
import httpx

from backend.config import settings

logger = logging.getLogger("cairn.llm")


async def _call_openai_compatible(
    base_url: str,
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    *,
    temperature: float = 0.7,
    max_tokens: int = 2048,
    extra_headers: dict[str, str] | None = None,
    timeout: float = 15.0,
) -> str:
    """Send request to an OpenAI-compatible endpoint and return response content string."""
    headers: dict[str, str] = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    if extra_headers:
        headers.update(extra_headers)

    url = f"{base_url.rstrip('/')}/chat/completions"
    payload: dict = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()

    data = resp.json()
    return data["choices"][0]["message"]["content"]


async def llm_complete_json(
    system_prompt: str,
    user_prompt: str,
    *,
    preferred_provider: str | None = None,
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> dict:
    """Call LLM with automatic multi-provider fallback cascade.

    Attempts primary provider (e.g. Groq), then secondary (e.g. Gemini),
    then OpenRouter/Ollama. Parses and returns JSON.
    """
    temp = temperature if temperature is not None else settings.llm_temperature
    tokens = max_tokens if max_tokens is not None else settings.llm_max_tokens

    # Build provider sequence
    primary = preferred_provider or settings.llm_provider
    providers_to_try = [primary]

    # Add remaining configured providers as backups
    for p in ["groq", "gemini", "openrouter", "ollama"]:
        if p not in providers_to_try:
            providers_to_try.append(p)

    errors = []

    for provider in providers_to_try:
        try:
            raw_content = ""
            if provider == "groq" and settings.groq_api_key:
                logger.info(f"[llm] Calling Groq ({settings.groq_model})...")
                raw_content = await _call_openai_compatible(
                    settings.groq_base_url,
                    settings.groq_api_key,
                    settings.groq_model,
                    system_prompt,
                    user_prompt,
                    temperature=temp,
                    max_tokens=tokens,
                )

            elif provider == "gemini" and settings.gemini_api_key:
                logger.info(f"[llm] Calling Gemini ({settings.gemini_model})...")
                raw_content = await _call_openai_compatible(
                    settings.gemini_base_url,
                    settings.gemini_api_key,
                    settings.gemini_model,
                    system_prompt,
                    user_prompt,
                    temperature=temp,
                    max_tokens=tokens,
                )

            elif provider == "openrouter" and settings.openrouter_api_key:
                logger.info(f"[llm] Calling OpenRouter ({settings.openrouter_model})...")
                raw_content = await _call_openai_compatible(
                    settings.openrouter_base_url,
                    settings.openrouter_api_key,
                    settings.openrouter_model,
                    system_prompt,
                    user_prompt,
                    temperature=temp,
                    max_tokens=tokens,
                    extra_headers={
                        "HTTP-Referer": "https://cairn.local",
                        "X-Title": "Cairn",
                    },
                )

            elif provider == "ollama":
                logger.info(f"[llm] Calling local Ollama ({settings.ollama_model})...")
                headers = {"Content-Type": "application/json"}
                url = f"{settings.ollama_base_url.rstrip('/')}/chat/completions"
                payload = {
                    "model": settings.ollama_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": temp,
                    "max_tokens": tokens,
                }
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.post(url, json=payload, headers=headers)
                    resp.raise_for_status()
                    data = resp.json()
                    raw_content = data["choices"][0]["message"]["content"]

            else:
                # Provider not configured with API key, skip to next
                continue

            # Parse JSON from response
            cleaned = raw_content.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                lines = [l for l in lines if not l.strip().startswith("```")]
                cleaned = "\n".join(lines)

            parsed = json.loads(cleaned)
            logger.info(f"[llm] Successfully received response from {provider}")
            return parsed

        except Exception as err:
            logger.warning(f"[llm] Provider '{provider}' failed: {err}. Pivoting to next provider...")
            errors.append(f"{provider}: {err}")

    # If all API attempts fail, raise RuntimeError so caller agent can use its fallback schema
    raise RuntimeError(f"All LLM providers failed: {'; '.join(errors)}")
