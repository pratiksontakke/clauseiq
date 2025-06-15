"""
Service for extracting and summarizing differences between contract versions using GPT.
"""
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage
from typing import Dict
import json
import os
from dotenv import load_dotenv
from server.app.core.supabase_client import supabase
from server.app.external_services.pdf_processor import PDFProcessor
import logging

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class DiffExtractor:
    def __init__(self):
        try:
            if not os.getenv("OPENAI_API_KEY"):
                raise ValueError("OPENAI_API_KEY not found in environment")
            self.llm = ChatOpenAI(
                model="gpt-4.1",
                temperature=0.2
            )
        except Exception as e:
            raise e

    async def extract_diff(self, contract_id: str, version_id: str, prev_file_url: str, curr_file_url: str):
        """
        Summarizes the major and minor changes between two contract versions using GPT.
        Returns a dictionary with a summary and a list of highlighted changes.
        """
        if prev_file_url.strip() == curr_file_url.strip():
            result = {
                "summary": "No changes detected between this version and the previous version.",
                "diffs": []
            }
            return result
        try:
            pdf_processor = PDFProcessor(supabase_client=supabase)
            prev_text = await pdf_processor.extract_text(prev_file_url)
            curr_text = await pdf_processor.extract_text(curr_file_url)
            if prev_text is None or curr_text is None:
                logger.error(f"Failed to extract text from one or both PDFs for contract {contract_id}, version {version_id}")
                return
            # Call LLM for diff summary
            try:
                diff_summary = await self._call_llm_for_diff_summary(prev_text, curr_text)
            except Exception as llm_exc:
                logger.error(f"LLM diff summary failed for contract {contract_id}, version {version_id}: {llm_exc}")
                return  # Only diff result is missing; do not raise
            # Store result in ai_tasks
            try:
                result = supabase.table("ai_tasks").upsert({
                    "contract_id": contract_id,
                    "version_id": version_id,
                    "type": "Diff",
                    "status": "Completed",
                    "result": diff_summary,
                }, on_conflict="contract_id,version_id,type").execute()
                return diff_summary
            except Exception as db_exc:
                logger.error(f"DB insert failed for diff result (contract {contract_id}, version {version_id}): {db_exc}")
                raise db_exc
        except Exception as e:
            logger.error(f"Unexpected error in diff extraction: {e}")
            return

    async def _call_llm_for_diff_summary(self, prev_text: str, curr_text: str):
        prompt = self._build_diff_prompt(prev_text, curr_text)
        messages = [HumanMessage(content=prompt)]
        response = await self.llm.ainvoke(messages)
        try:
            return self._parse_gpt_response(response.content)
        except Exception as e:
            logger.error(f"Failed to parse LLM response: {e}")
            raise e

    def _build_diff_prompt(self, prev_text: str, curr_text: str) -> str:
        prompt = f"""You are a contract analyst. Compare the following two versions of a contract. List the most significant changes first (e.g., changes to payment terms, liability, termination, etc.), then mention any minor changes only if they could affect the contract's meaning. Ignore purely cosmetic edits.\n\nReturn the results in this exact JSON format:\n{{\n  \"summary\": \"...\",\n  \"diffs\": [\n    {{\n      \"section\": \"...\",\n      \"old\": \"...\",\n      \"new\": \"...\"\n    }}\n  ]\n}}\n\nPrevious version:\n{prev_text}\n\nCurrent version:\n{curr_text}\n"""
        return prompt

    def _parse_gpt_response(self, response: str) -> Dict:
        try:
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON found in response")
            json_str = response[start_idx:end_idx]
            result = json.loads(json_str)
            if "summary" not in result or "diffs" not in result:
                raise ValueError("Invalid response structure: missing 'summary' or 'diffs' key")
            return result
        except json.JSONDecodeError as e:
            raise e
        except Exception as e:
            raise e 