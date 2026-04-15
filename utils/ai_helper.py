"""Unified AI helper with fallback chain: Gemini -> Grok -> deterministic."""

import os
import requests
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from .fallback_manager import (
    get_fallback_quiz,
    get_fallback_code_feedback,
    get_fallback_chat_answer
)

load_dotenv()

class AIHelper:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.grok_key = os.getenv("GROK_API_KEY")
        # For now, we implement mock calls; real API integration in Phase C
        self.use_mock = True  # Set to False when real keys are ready in Phase C

    def call_gemini(self, prompt: str) -> Optional[str]:
        """Call Gemini API (mock or real)."""
        if self.use_mock or not self.gemini_key:
            # Mock response for development
            return self._mock_ai_response(prompt)
        # Real implementation will be added in Phase C
        # TODO: Implement actual Gemini API call
        return None

    def call_grok(self, prompt: str) -> Optional[str]:
        """Call Grok API (mock or real)."""
        if self.use_mock or not self.grok_key:
            return self._mock_ai_response(prompt)
        # TODO: Implement actual Grok API call
        return None

    def _mock_ai_response(self, prompt: str) -> str:
        """Generate mock AI response for testing."""
        if "quiz" in prompt.lower():
            return "MOCK: Here's a quiz question about ML..."
        elif "code feedback" in prompt.lower():
            return "MOCK: Your code looks good! Remember to test edge cases."
        elif "chat" in prompt.lower():
            return "MOCK: That's an interesting ML concept. Let me explain..."
        else:
            return "MOCK: AI is ready to help with AIML concepts!"

    def call_ai_with_fallback(self, prompt: str, fallback_type: str, **kwargs) -> Any:
        """
        Unified entry point for AI features.
        fallback_type: 'quiz', 'code_feedback', 'chat'
        Returns appropriate response (list for quiz, string for others).
        """
        # Try Gemini
        response = self.call_gemini(prompt)
        if response:
            # In real implementation, parse JSON for quiz, etc.
            return self._process_response(response, fallback_type, **kwargs)
        
        # Try Grok
        response = self.call_grok(prompt)
        if response:
            return self._process_response(response, fallback_type, **kwargs)
        
        # Deterministic fallback
        if fallback_type == "quiz":
            topic = kwargs.get("topic", "machine learning")
            return get_fallback_quiz(topic)
        elif fallback_type == "code_feedback":
            code = kwargs.get("code", "")
            error = kwargs.get("error", "")
            return get_fallback_code_feedback(code, error)
        elif fallback_type == "chat":
            question = kwargs.get("question", "")
            return get_fallback_chat_answer(question)
        else:
            return "Fallback: AI service unavailable."

    def _process_response(self, response: str, fallback_type: str, **kwargs):
        """Convert raw AI response to expected format."""
        # For now, just return fallback for everything until Phase C.
        # In Phase C, we'll parse AI-generated JSON.
        if fallback_type == "quiz":
            topic = kwargs.get("topic", "machine learning")
            return get_fallback_quiz(topic)
        elif fallback_type == "code_feedback":
            code = kwargs.get("code", "")
            error = kwargs.get("error", "")
            return get_fallback_code_feedback(code, error)
        else:
            return get_fallback_chat_answer(kwargs.get("question", ""))

# Singleton instance
ai_helper = AIHelper()

def get_ai_helper():
    return ai_helper