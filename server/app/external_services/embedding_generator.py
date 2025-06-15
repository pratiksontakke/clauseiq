"""
Service for generating and storing embeddings from contract text.
"""
from typing import List, Dict
import openai
from langchain_openai import OpenAIEmbeddings
import os
from dotenv import load_dotenv
import logging
import tiktoken
from server.app.core.supabase_client import supabase

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class EmbeddingGenerator:
    def __init__(self):
        try:
            if not os.getenv("OPENAI_API_KEY"):
                raise ValueError("OPENAI_API_KEY not found in environment")
            self.embeddings = OpenAIEmbeddings(
                model="text-embedding-3-small"
            )
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
        except Exception as e:
            logger.error(f"Failed to initialize EmbeddingGenerator: {e}")
            raise e

    def _chunk_text(self, text: str, chunk_size: int = 500) -> List[Dict]:
        """
        Split text into chunks with page tracking.
        """
        chunks = []
        current_chunk = ""
        current_length = 0
        
        # Estimate page numbers (rough heuristic)
        chars_per_page = 3000
        
        for i, char in enumerate(text):
            current_chunk += char
            current_length += 1
            
            if current_length >= chunk_size and char in '.!?':
                page_num = (i // chars_per_page) + 1
                chunks.append({
                    "text": current_chunk.strip(),
                    "page": page_num
                })
                current_chunk = ""
                current_length = 0
        
        if current_chunk:
            page_num = (len(text) // chars_per_page) + 1
            chunks.append({
                "text": current_chunk.strip(),
                "page": page_num
            })
        
        return chunks

    async def generate_and_store(self, contract_id: str, version_id: str, text: str) -> bool:
        """
        Generate embeddings for text chunks and store in Supabase.
        """
        try:
            # Split text into chunks
            chunks = self._chunk_text(text)
            
            for i, chunk in enumerate(chunks):
                # Generate embedding
                embedding = await self.embeddings.aembed_query(chunk["text"])
                
                # Store in Supabase
                chunk_id = f"chunk_{i+1}"
                try:
                    supabase.table("embeddings").insert({
                        "contract_id": contract_id,
                        "version_id": version_id,
                        "chunk_id": chunk_id,
                        "embedding": embedding,
                        "text": chunk["text"],
                        "page_num": chunk["page"]
                    }).execute()
                except Exception as db_exc:
                    logger.error(f"Failed to store embedding for chunk {chunk_id}: {db_exc}")
                    continue
            
            return True
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            return False 