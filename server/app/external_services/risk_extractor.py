"""
Service for extracting risks from contract text using GPT.
"""
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage
from typing import Dict, Optional
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class RiskExtractor:
    def __init__(self):
        print("[DEBUG] Initializing RiskExtractor")
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

    async def extract_risks(self, text: str) -> Dict:
        """
        Extracts risks from contract text using GPT.
        Returns a dictionary with a list of risks.
        """
        try:
            prompt = self._build_risk_prompt(text)
            messages = [HumanMessage(content=prompt)]
            response = await self.llm.ainvoke(messages)
            try:
                risks = self._parse_gpt_response(response.content)
                # Only log the final parsed JSON output once
                print(f"[INFO] Final risk extraction JSON output: {json.dumps(risks, indent=2)}")
                return risks
            except Exception as e:
                raise e
        except Exception as e:
            raise e

    def _build_risk_prompt(self, text: str) -> str:
        """
        Builds the prompt for GPT to extract risks.
        """
        print("[DEBUG] Building risk extraction prompt")
        prompt = f"""You are a legal risk analyst. Review the following contract text and identify all passages that may present legal, financial, or compliance risks.\n\nFor each risk, return:\n- Severity: high, medium, or low\n- Description: a short summary of the risk\n- Risky text: the exact passage from the contract\n- Page: the page number (estimate based on text position)\n- Recommendation: a brief suggestion to mitigate the risk\n\nReturn the results in this exact JSON format:\n{{\n  \"risks\": [\n    {{\n      \"severity\": \"high\",\n      \"description\": \"...\",\n      \"risky_text\": \"...\",\n      \"page\": 3,\n      \"recommendation\": \"...\"\n    }}\n  ]\n}}\n\nContract text:\n{text}\n"""
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
            if "risks" not in result:
                print("[ERROR] Invalid response structure: missing 'risks' key")
                raise ValueError("Invalid response structure: missing 'risks' key")
            # Validate each risk
            for risk in result["risks"]:
                required_keys = ["severity", "description", "risky_text", "page", "recommendation"]
                missing_keys = [key for key in required_keys if key not in risk]
                if missing_keys:
                    print(f"[ERROR] Invalid risk structure: missing keys {missing_keys}")
                    raise ValueError(f"Invalid risk structure: missing keys {missing_keys}")
            print("[DEBUG] Response parsed successfully")
            return result
        except json.JSONDecodeError as e:
            print(f"[ERROR] Failed to decode JSON response: {str(e)}")
            raise e
        except Exception as e:
            print(f"[ERROR] Failed to parse response: {str(e)}")
            raise e 