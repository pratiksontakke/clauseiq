import { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import { KeyboardEvent, ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contracts } from '../services/api';

interface Citation {
  text: string;
  page: number;
}

interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  citations?: Citation[];
  timestamp: number;
}

interface ChatResponse {
  answer: string;
  citations: Citation[];
}

interface ContractChatProps {
  contractId: string;
  versionId?: string;
}

const MAX_CHAT_HISTORY = 5;

export function ContractChat({ contractId, versionId }: ContractChatProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCitations, setShowCitations] = useState<number | null>(null);

  // Fetch contract details to get latest version
  const { data: contract } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => contracts.getDetails(contractId),
    enabled: !!contractId,
  });

  // Get latest version ID
  const latestVersionId = contract?.versions
    ? [...contract.versions].sort((a, b) => b.version_num - a.version_num)[0]?.id
    : versionId;

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(`chat_history_${contractId}`);
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      // Only set if different from current
      if (JSON.stringify(parsedHistory) !== JSON.stringify(chatHistory)) {
        setChatHistory(parsedHistory);
      }
    }
  }, [contractId]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    // Only update if we need to limit the history
    if (chatHistory.length > MAX_CHAT_HISTORY) {
      const limitedHistory = chatHistory.slice(-MAX_CHAT_HISTORY);
      setChatHistory(limitedHistory);
    }
    // Always save to localStorage
    localStorage.setItem(`chat_history_${contractId}`, JSON.stringify(chatHistory));
  }, [chatHistory, contractId]);

  const sendMessage = async () => {
    if (!message.trim() || !latestVersionId) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No auth token available');
      }

      // Add user message to chat history
      const userMessage: ChatMessage = {
        type: 'user',
        text: message,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, userMessage]);

      // Log request details
      console.log('Sending chat request:', {
        url: `http://127.0.0.1:8000/contracts/${contractId}/versions/${latestVersionId}/chat`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: { text: message }
      });

      const response = await fetch(
        `http://127.0.0.1:8000/contracts/${contractId}/versions/${latestVersionId}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ text: message }),
        }
      );

      if (!response.ok) {
        console.error('Chat request failed:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error('Failed to send message');
      }

      const data: ChatResponse = await response.json();
      console.log('Chat response:', data);
      
      // Add AI response to chat history
      const aiMessage: ChatMessage = {
        type: 'ai',
        text: data.answer,
        citations: data.citations,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, aiMessage]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {chatHistory.map((msg, index) => (
          <div key={msg.timestamp} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`relative max-w-[80%] rounded-lg px-4 py-2 ${
                msg.type === 'user' 
                  ? 'bg-coral-primary text-white' 
                  : 'bg-cloud-bg text-ink-text hover:bg-cloud-bg/90 transition-colors'
              }`}
              onMouseEnter={() => msg.type === 'ai' && setShowCitations(index)}
              onMouseLeave={() => setShowCitations(null)}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              
              {/* Citations tooltip */}
              {msg.type === 'ai' && showCitations === index && msg.citations && msg.citations.length > 0 && (
                <div className="absolute left-0 bottom-full mb-2 w-full bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                  <div className="font-medium mb-2 text-sm">Citations:</div>
                  {msg.citations.map((citation, citationIndex) => (
                    <div key={citationIndex} className="text-xs mb-2 last:mb-0">
                      <div className="font-medium">Page {citation.page}</div>
                      <div className="line-clamp-2 text-gray-600">{citation.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            placeholder="Ask a question about this contract..."
            onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading || !latestVersionId}
          />
          <Button 
            onClick={sendMessage}
            disabled={isLoading || !message.trim() || !latestVersionId}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
} 