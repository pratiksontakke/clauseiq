"""
Service for extracting clauses from contract text using GPT.
"""
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage
from typing import Dict, List, Optional
import json
import os
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

class ClauseExtractor:
    def __init__(self):
        print("[DEBUG] Initializing ClauseExtractor")
        try:
            print("[DEBUG] Setting up ChatOpenAI...")
            if not os.getenv("OPENAI_API_KEY"):
                raise ValueError("OPENAI_API_KEY not found in environment")
                
            self.llm = ChatOpenAI(
                model="gpt-4.1",
                temperature=0.2
            )
            print("[DEBUG] ChatOpenAI initialized successfully")
        except Exception as e:
            print(f"[ERROR] Failed to initialize ChatOpenAI: {str(e)}")
            raise e

    async def extract_clauses(self, text: str) -> Dict:
        """
        Extracts key clauses from contract text using GPT.
        Returns a dictionary of clause types and their content.
        """
        try:
            prompt = self._build_extraction_prompt(text)
            messages = [HumanMessage(content=prompt)]
            response = await self.llm.ainvoke(messages)
            try:
                clauses = self._parse_gpt_response(response.content)
                # Only log the final parsed JSON output once
                print(f"[INFO] Final clause extraction JSON output: {json.dumps(clauses, indent=2)}")
                return clauses
            except Exception as e:
                raise e
        except Exception as e:
            raise e

    def _build_extraction_prompt(self, text: str) -> str:
        """
        Builds the prompt for GPT to extract clauses.
        """
        print("[DEBUG] Building extraction prompt")
        prompt = f"""You are a legal document analyzer. Extract key clauses from the following contract text.

For each clause found, you must provide:
1. The exact text of the clause
2. The page number where it appears (estimate based on text position)
3. A confidence score between 0 and 1

Key clauses to look for:
- Payment Terms
- Termination
- Liability
- Confidentiality

You must return the results in this exact JSON format:
{{
    "clauses": [
        {{
            "type": "clause_type",
            "text": "exact_clause_text",
            "page": page_number,
            "confidence": confidence_score
        }}
    ]
}}

Contract text:
{text}
"""
        print("[DEBUG] Prompt built successfully")
        return prompt

    def _parse_gpt_response(self, response: str) -> Dict:
        """
        Parses GPT's response into a structured format.
        """
        print("[DEBUG] Parsing GPT response")
        try:
            # Try to find JSON in the response
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON found in response")
            
            json_str = response[start_idx:end_idx]
            
            # Parse JSON response
            result = json.loads(json_str)
            
            # Validate structure
            if "clauses" not in result:
                print("[ERROR] Invalid response structure: missing 'clauses' key")
                raise ValueError("Invalid response structure: missing 'clauses' key")
            
            # Validate each clause
            for clause in result["clauses"]:
                required_keys = ["type", "text", "page", "confidence"]
                missing_keys = [key for key in required_keys if key not in clause]
                if missing_keys:
                    print(f"[ERROR] Invalid clause structure: missing keys {missing_keys}")
                    raise ValueError(f"Invalid clause structure: missing keys {missing_keys}")
            
            print("[DEBUG] Response parsed successfully")
            return result
        except json.JSONDecodeError as e:
            print(f"[ERROR] Failed to decode JSON response: {str(e)}")
            raise e
        except Exception as e:
            print(f"[ERROR] Failed to parse response: {str(e)}")
            raise e 