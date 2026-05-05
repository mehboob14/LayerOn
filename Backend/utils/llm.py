"""LLM provider routing for module chat."""
from __future__ import annotations

from langchain_openai import ChatOpenAI

from ..config import ANTHROPIC_API_KEY, GOOGLE_API_KEY, OPENAI_API_KEY
from ..models import Module


def get_llm_for_module(module: Module) -> ChatOpenAI:
    provider = (module.provider or "openai").lower()
    model_name = module.model or "gpt-4o-mini"

    if provider == "claude":
        return ChatOpenAI(
            model=model_name,
            api_key=ANTHROPIC_API_KEY or OPENAI_API_KEY,
            base_url="https://api.anthropic.com/v1" if ANTHROPIC_API_KEY else None,
        )
    if provider == "gemini":
        return ChatOpenAI(
            model=model_name,
            api_key=GOOGLE_API_KEY or OPENAI_API_KEY,
        )
    return ChatOpenAI(model=model_name, api_key=OPENAI_API_KEY)
