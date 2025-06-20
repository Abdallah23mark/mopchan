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
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    if (!username) {
      setUsername(generateUsername());
    }
  }, []);

  // Auto-scroll chat container to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      const container = chatContainerRef.current;
      
      // Always scroll to bottom on first load
      if (isFirstLoad) {
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight;
            setIsFirstLoad(false);
          }
        }, 100);
        return;
      }
      
      // For subsequent messages, only scroll if user is near bottom
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }, 50);
      }
    }
  }, [messages, isFirstLoad]);

  // Initialize WebSocket when expanded
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      if (!isExpanded) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('🔗 Creating WebSocket connection to:', wsUrl);
      
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          setSocket(ws);
          
          // Fetch initial messages only if we don't have any
          if (messages.length === 0) {
            fetch("/api/chat/messages")
              .then(res => res.json())
              .then(data => {
                if (Array.isArray(data)) {
                  const formattedMessages = data.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.createdAt)
                  }));
                  console.log('📦 Loaded initial messages:', formattedMessages.length);
                  messagesRef.current = formattedMessages;
                  setMessages(formattedMessages);
                }
              })
              .catch(console.error);
          }
          
          // Send ping to confirm connection
          ws?.send(JSON.stringify({ type: 'ping' }));
        };
        
        ws.onmessage = (event) => {
          try {
            console.log('RAW WebSocket data received:', event.data);
            const data = JSON.parse(event.data);
            console.log('PARSED WebSocket data:', data);
            
            if (data.type === 'chat_message' && data.message) {
              const newMsg = {
                ...data.message,
                timestamp: new Date(data.message.createdAt)
              };
              console.log('PROCESSING new message:', newMsg);
              
              // Update messages using ref to prevent stale closures
              const messageExists = messagesRef.current.some(msg => msg.id === newMsg.id);
              if (!messageExists) {
                messagesRef.current = [...messagesRef.current, newMsg];
                setMessages([...messagesRef.current]);
                setForceUpdate(prev => prev + 1);
                console.log('MESSAGE ADDED to state. Total:', messagesRef.current.length);
              } else {
                console.log('DUPLICATE message prevented:', newMsg.id);
              }
            } else if (data.type === 'pong') {
              console.log('PONG received from server');
            } else {
              console.log('UNKNOWN message type:', data.type);
            }
          } catch (err) {
            console.error("ERROR parsing WebSocket message:", err);
          }
        };
        
        ws.onclose = (event) => {
          console.log('🔌 WebSocket closed:', event.code);
          setSocket(null);
          
          // Auto-reconnect if chatroom is still open and closure was unexpected
          if (isExpanded && event.code !== 1000) {
            console.log('🔄 Reconnecting in 3 seconds...');
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setSocket(null);
        };
        
      } catch (err) {
        console.error("Failed to create WebSocket:", err);
      }
    };

    if (isExpanded) {
      connectWebSocket();
    } else {
      // Close connection when chatroom is closed
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setIsFirstLoad(true);
    }

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
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
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'chat_message',
          username: username,
          message: messageText,
          tripcode: userTripcode || null
        }));
        setInputMessage("");
        console.log('MESSAGE SENT via WebSocket');
      } else {
        console.error('WebSocket not connected');
      }
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
          <div key={index} className="theme-text-green break-words">
            {line}
          </div>
        );
      }
      return <div key={index} className="break-words">{line || "\u00A0"}</div>;
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
        <div className="mt-4 theme-bg-post theme-border border p-4 w-full max-w-2xl">
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
          
          <div 
            ref={chatContainerRef}
            className="h-64 overflow-y-auto theme-border border p-2 bg-white text-xs mb-3" 
            id="chat-messages"
          >
            <div className="space-y-2">
              {messages.length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-1 text-left">
                  <div className="flex gap-2 items-baseline">
                    <span className="font-bold theme-text-green flex-shrink-0">
                      {msg.username}
                      {msg.tripcode && <span className="theme-text-quote"> !{msg.tripcode}</span>}
                    </span>
                    <span className="text-gray-600 text-xs flex-shrink-0">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="ml-2 break-words overflow-wrap-anywhere">
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
                maxLength={2000}
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