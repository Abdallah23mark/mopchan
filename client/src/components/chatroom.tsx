import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Chatroom() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [nameField, setNameField] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const name = nameField || "Anonymous";
    const messageText = `${name}: ${newMessage}`;
    setMessages(prev => [...prev, messageText]);
    setNewMessage("");
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
        <div className="mt-4 bg-gray-50 border p-4 w-full max-w-4xl mx-auto">
          <div className="mb-2">
            <div className="font-bold text-sm mb-1">Mopchan Chatroom</div>
            <div className="text-xs text-gray-600">
              Local chat (temporary until real-time is stable)
            </div>
          </div>
          
          <div className="h-64 overflow-y-auto border p-2 bg-white text-xs mb-3">
            <div className="space-y-2">
              {messages.length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className="text-left">
                  {msg}
                </div>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <Input
                value={nameField}
                onChange={(e) => setNameField(e.target.value)}
                placeholder="Name"
                className="w-24 text-xs"
              />
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type message..."
                className="flex-1 text-xs"
                maxLength={500}
              />
              <Button 
                type="submit" 
                className="bg-white border text-xs hover:bg-gray-100 text-black"
                disabled={!newMessage.trim()}
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