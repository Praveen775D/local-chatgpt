'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';

export default function Home() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const controllerRef = useRef(null);

  const fetchChats = async () => {
    const res = await fetch('http://localhost:5000/api/chats');
    const data = await res.json();
    setChats(data);
  };

  const handleSelectChat = async (id) => {
    const res = await fetch(`http://localhost:5000/api/chat/${id}`);
    const data = await res.json();
    setChatId(id);
    setMessages(data);
  };

  const handleNewChat = async () => {
    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    setChatId(data.id);
    setMessages([]);
    fetchChats();
  };

  const handleDeleteChat = async (id) => {
    await fetch(`http://localhost:5000/api/chat/${id}`, { method: 'DELETE' });
    setMessages([]);
    setChatId(null);
    fetchChats();
  };

  const handleRenameChat = async (id, newTitle) => {
    await fetch(`http://localhost:5000/api/chat/${id}/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });
    fetchChats();
  };

  const handleSendMessage = async (text) => {
    let activeChatId = chatId;

    if (!chatId) {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      activeChatId = data.id;
      setChatId(data.id);
      setMessages([]);
      fetchChats();
    }

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsStreaming(true);

    controllerRef.current = new AbortController();

    try {
      const res = await fetch(`http://localhost:5000/api/chat/${activeChatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: controllerRef.current.signal,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value).replace(/^data:\s*/, '');
        aiMessage += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];

          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: aiMessage };
          } else {
            updated.push({ role: 'assistant', content: aiMessage });
          }

          return updated;
        });
      }
   } catch (error) {
      if (error.name !== 'AbortError') {
         console.error('Streaming error:', error);
       }
     }

    setIsStreaming(false);
  };

  const handleRetry = (text) => {
    handleSendMessage(text);
  };

  const handleStop = () => {
    controllerRef.current?.abort();
    setIsStreaming(false);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar
        chats={chats}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />
      <div className="flex flex-col flex-1">
        <ChatWindow messages={messages} onRetry={handleRetry} />
        <ChatInput onSend={handleSendMessage} onStop={handleStop} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
