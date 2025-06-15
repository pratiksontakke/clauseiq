from openai import OpenAI
import os
import json
from typing import Dict, Any
import logging
from ..models.clause_extraction import ClauseExtractionResult

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def load_prompt_template(name: str) -> str:
    """Load a prompt template from the prompts directory."""
    prompt_path = os.path.join(os.path.dirname(__file__), "..", "prompts", f"{name}.txt")
    with open(prompt_path, "r") as f:
        return f.read()

def extract_clauses_with_gpt4(text: str) -> ClauseExtractionResult:
    """
    Extract clauses from contract text using GPT-4.
    Returns a validated ClauseExtractionResult.
    """
    try:
        # Load and format prompt
        prompt_template = load_prompt_template("clause_extraction")
        prompt = prompt_template.format(text=text)
        
        # Call GPT-4
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a legal document analyzer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,  # Lower temperature for more consistent output
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        # Parse response
        result = json.loads(response.choices[0].message.content)
        
        # Validate with Pydantic
        return ClauseExtractionResult(**result)
        
    except Exception as e:
        logger.error(f"Error in clause extraction: {str(e)}")
        raise 