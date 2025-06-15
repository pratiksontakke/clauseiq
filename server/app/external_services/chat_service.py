"""
Service for contract Q&A using RAG (Retrieval Augmented Generation).
"""
from typing import Dict, List, Optional
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings
from langchain.schema import HumanMessage
import json
import os
from dotenv import load_dotenv
import logging
from server.app.core.supabase_client import supabase

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        try:
            if not os.getenv("OPENAI_API_KEY"):
                raise ValueError("OPENAI_API_KEY not found in environment")
            self.llm = ChatOpenAI(
                model="gpt-3.5-turbo",
                temperature=0.2
            )
            self.embeddings = OpenAIEmbeddings(
                model="text-embedding-3-small"
            )
        except Exception as e:
            logger.error(f"Failed to initialize ChatService: {e}")
            raise e

    async def get_answer(self, contract_id: str, version_id: str, question: str) -> Dict:
        """
        Get answer for a question about a specific contract version.
        """
        try:
            # Generate question embedding
            question_embedding = await self.embeddings.aembed_query(question)
            
            # Find relevant chunks using vector similarity
            chunks = supabase.rpc(
                'match_chunks',
                {
                    'query_embedding': question_embedding,
                    'match_count': 3,
                    'contract_version_id': version_id
                }
            ).execute()
            
            if not chunks.data:
                return {
                    "answer": "I couldn't find relevant information in the contract to answer your question.",
                    "citations": []
                }
            
            # Build context from chunks
            context = "\n\n".join([chunk["text"] for chunk in chunks.data])
            citations = [
                {
                    "text": chunk["text"],
                    "page": chunk["page_num"]
                } for chunk in chunks.data
            ]
            
            # Get answer from GPT
            messages = [
                HumanMessage(content=self._build_prompt(question, context))
            ]
            response = await self.llm.ainvoke(messages)
            
            # Return result directly without storing
            return {
                "answer": response.content,
                "citations": citations
            }
            
        except Exception as e:
            logger.error(f"Failed to get answer: {e}")
            return {
                "answer": "Sorry, I encountered an error while processing your question. Please try again.",
                "citations": []
            }

    def _build_prompt(self, question: str, context: str) -> str:
        """
        Build prompt for GPT with question and context.
        """
        return f"""You are a helpful contract analysis assistant. Answer the following question using ONLY the provided contract context. If you cannot find the answer in the context, say so.

Question: {question}

Contract Context:
{context}

Answer the question concisely and accurately, referring to specific parts of the contract when relevant.""" 