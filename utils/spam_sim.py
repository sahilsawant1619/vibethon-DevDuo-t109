import re
from typing import Dict, List, Tuple

class SpamClassifier:
    """Rule-based spam classifier with AI explanation"""
    
    def __init__(self):
        # Spam keywords list
        self.spam_keywords = [
            "free", "win", "lottery", "click", "urgent", "congratulations", 
            "prize", "winner", "claim", "money", "cash", "bonus", "reward",
            "offer", "deal", "discount", "save", "limited", "exclusive",
            "instant", "guaranteed", "risk-free", "million", "billion",
            "investment", "opportunity", "viagra", "casino", "poker",
            "weight", "loss", "diet", "pill", "medicine", "health",
            "congrats", "selected", "notify", "verify", "account",
            "suspended", "blocked", "security", "update", "confirm"
        ]
        
        # AI helper for explanations (will be initialized when needed)
        self.ai_helper = None
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract spam keywords from text"""
        # Convert to lowercase for case-insensitive matching
        text_lower = text.lower()
        
        # Find keywords using word boundaries to avoid partial matches
        found_keywords = []
        for keyword in self.spam_keywords:
            # Use regex to match whole words
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, text_lower):
                found_keywords.append(keyword)
        
        return found_keywords
    
    def calculate_confidence(self, keyword_count: int, is_spam: bool) -> float:
        """Calculate confidence based on keyword count"""
        if is_spam:
            # For spam: confidence increases with more keywords
            confidence = min(0.5 + 0.1 * keyword_count, 0.95)
        else:
            # For ham: confidence decreases with more keywords
            confidence = max(0.8 - 0.1 * keyword_count, 0.3)
        
        return round(confidence, 2)
    
    def classify_spam(self, text: str) -> Dict[str, object]:
        """
        Classify text as spam or ham
        
        Args:
            text: Input text to classify
            
        Returns:
            Dictionary with prediction, confidence, and keywords_found
        """
        if not text or not text.strip():
            return {
                'prediction': 'ham',
                'confidence': 0.5,
                'keywords_found': [],
                'error': 'Empty text provided'
            }
        
        # Extract keywords
        keywords_found = self.extract_keywords(text)
        keyword_count = len(keywords_found)
        
        # Classify based on keyword count
        if keyword_count >= 2:
            prediction = 'spam'
        else:
            prediction = 'ham'
        
        # Calculate confidence
        confidence = self.calculate_confidence(keyword_count, prediction == 'spam')
        
        return {
            'prediction': prediction,
            'confidence': confidence,
            'keywords_found': keywords_found,
            'keyword_count': keyword_count
        }
    
    async def get_ai_explanation(self, text: str, prediction: str, keywords_found: List[str]) -> str:
        """
        Get AI explanation for the spam classification
        
        Args:
            text: Original text
            prediction: Spam/ham prediction
            keywords_found: List of keywords found
            
        Returns:
            AI explanation string
        """
        # Try to import AI helper if available
        if self.ai_helper is None:
            try:
                from ai_helper import AIHelper
                self.ai_helper = AIHelper()
            except ImportError:
                pass
        
        # Create prompt for AI explanation
        if prediction == 'spam':
            prompt = f"""Explain why this message is classified as spam:
            
Message: "{text}"
Keywords found: {', '.join(keywords_found)}

Please provide a brief explanation of why this message appears to be spam, mentioning the specific indicators."""
        else:
            prompt = f"""Explain why this message is classified as ham (not spam):
            
Message: "{text}"
Keywords found: {', '.join(keywords_found)} (if any)

Please provide a brief explanation of why this message appears to be legitimate."""
        
        try:
            # Get AI response with fallback if AI helper is available
            if self.ai_helper:
                response = await self.ai_helper.call_ai_with_fallback(
                    prompt=prompt,
                    fallback_type='chat'
                )
                return response
            else:
                # Use fallback explanation if AI helper is not available
                raise ImportError("AI helper not available")
            
        except Exception as e:
            # Fallback explanation if AI fails
            if prediction == 'spam':
                return f"This message was classified as spam because it contains {len(keywords_found)} spam indicators: {', '.join(keywords_found)}. These keywords are commonly associated with unsolicited promotional or fraudulent messages."
            else:
                if keywords_found:
                    return f"This message was classified as legitimate despite containing {len(keywords_found)} potentially suspicious keywords: {', '.join(keywords_found)}. However, the overall context and limited keyword count suggest it's a legitimate message."
                else:
                    return "This message was classified as legitimate because it doesn't contain typical spam indicators and appears to have normal communication patterns."

# Global classifier instance
spam_classifier = SpamClassifier()

def classify_spam(text: str) -> Dict[str, object]:
    """
    Classify text as spam or ham (synchronous wrapper)
    
    Args:
        text: Input text to classify
        
    Returns:
        Dictionary with prediction, confidence, and keywords_found
    """
    return spam_classifier.classify_spam(text)

async def get_spam_explanation(text: str, prediction: str, keywords_found: List[str]) -> str:
    """
    Get AI explanation for spam classification (async wrapper)
    
    Args:
        text: Original text
        prediction: Spam/ham prediction
        keywords_found: List of keywords found
        
    Returns:
        AI explanation string
    """
    return await spam_classifier.get_ai_explanation(text, prediction, keywords_found)

if __name__ == "__main__":
    # Test the classifier
    test_messages = [
        "Win a free iPhone now! Click here to claim your prize!",
        "Meeting tomorrow at 10 AM in conference room B",
        "URGENT: Congratulations! You've won $1,000,000 in our lottery!",
        "Hi, how are you doing today?",
        "Limited time offer: Get 50% off on all products!"
    ]
    
    print("Spam Classifier Test:")
    print("=" * 50)
    
    for message in test_messages:
        result = classify_spam(message)
        print(f"Message: {message}")
        print(f"Prediction: {result['prediction']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Keywords: {result['keywords_found']}")
        print("-" * 30)
