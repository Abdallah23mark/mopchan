import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: Date;
  tripcode?: string;
}

const generateUsername = () => {
  const adjectives = ['Anonymous', 'Lurker', 'Anon', 'Poster', 'Visitor', 'Guest', 'User', 'Peasant', 'Newfag', 'Oldfag'];
  const numbers = Math.floor(Math.random() * 9999);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${numbers}`;
};

const generateTripcode = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).slice(0, 8).toUpperCase();
};

export default function Chatroom() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [username, setUsername] = useState("");
  const [tripcode, setTripcode] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!username) {
      setUsername(generateUsername());
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize WebSocket when expanded
  useEffect(() => {
    if (!isExpanded) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Connected to chat');
        setSocket(ws);
        // Fetch initial messages
        fetch("/api/chat/messages")
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              const formattedMessages = data.map(msg => ({
                ...msg,
                timestamp: new Date(msg.createdAt)
              }));
              setMessages(formattedMessages);
            }
          })
          .catch(console.error);
      };
      
      ws.onmessage = (event) => {
        try {
          console.log('Received WebSocket message:', event.data);
          const data = JSON.parse(event.data);
          console.log('Parsed WebSocket data:', data);
          if (data.type === 'chat_message' && data.message) {
            const newMsg = {
              ...data.message,
              timestamp: new Date(data.message.createdAt)
            };
            console.log('Adding new message to state:', newMsg);
            setMessages(prev => {
              console.log('Current messages before update:', prev);
              const updated = [...prev, newMsg];
              console.log('Updated messages after add:', updated);
              return updated;
            });
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };
      
      ws.onclose = () => {
        console.log('Disconnected from chat');
        setSocket(null);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      return () => {
        ws.close();
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
    }
  }, [isExpanded]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "" || !socket) return;

    let messageText = inputMessage.trim();
    let userTripcode = "";

    // Check for tripcode in message (format: message#password)
    const tripcodeMatch = messageText.match(/^(.*)#(.+)$/);
    if (tripcodeMatch) {
      messageText = tripcodeMatch[1].trim();
      const password = tripcodeMatch[2];
      userTripcode = generateTripcode(password);
    }

    try {
      socket.send(JSON.stringify({
        type: 'chat_message',
        username: username,
        message: messageText,
        tripcode: userTripcode || null
      }));
      setInputMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessage = (message: string) => {
    return message.split('\n').map((line, index) => {
      if (line.startsWith('>')) {
        return (
          <div key={index} className="theme-text-green">
            {line}
          </div>
        );
      }
      return <div key={index}>{line || "\u00A0"}</div>;
    });
  };

  return (
    <div className="mt-2">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 underline text-xs flex items-center gap-1 hover:text-blue-800"
      >
        Chatroom
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      
      {isExpanded && (
        <div className="mt-4 theme-bg-post theme-border border p-4 w-full max-w-4xl mx-auto">
          <div className="mb-2">
            <div className="font-bold text-sm theme-text-main mb-1">Mopchan Chatroom</div>
            <div className="text-xs text-gray-600">
              Your username: <span className="font-bold theme-text-green">{username}</span>
              {tripcode && <span className="theme-text-quote"> !{tripcode}</span>}
            </div>
            <div className="text-xs text-gray-500">
              Add tripcode: Type your message followed by #password
            </div>
          </div>
          
          <div className="h-64 overflow-y-auto theme-border border p-2 bg-white text-xs mb-3">
            <div className="space-y-2">
              {messages.length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-1 text-left">
                  <div className="flex gap-2 items-baseline">
                    <span className="font-bold theme-text-green">
                      {msg.username}
                      {msg.tripcode && <span className="theme-text-quote"> !{msg.tripcode}</span>}
                    </span>
                    <span className="text-gray-600 text-xs">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="ml-2">
                    {formatMessage(msg.message)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <form onSubmit={handleSendMessage}>
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type message... (add #password for tripcode)"
                className="text-xs theme-border"
                maxLength={500}
              />
              <Button 
                type="submit" 
                className="bg-white theme-border border text-xs hover:bg-gray-100 theme-text-main"
                disabled={!inputMessage.trim()}
              >
                Send
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}