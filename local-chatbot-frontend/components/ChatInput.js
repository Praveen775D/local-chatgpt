'use client';

import { useState } from "react";

export default function ChatInput({ onSend, onStop, isStreaming }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSend(input);
        setInput("");
      }
    } else if (e.key === "Escape") {
      onStop();
    }
  };

  return (
    <div className="p-4 bg-gray-200">
      <textarea
        className="w-full border rounded p-2"
        rows={2}
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={() => {
            if (input.trim()) {
              onSend(input);
              setInput("");
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>

        {isStreaming && (
          <button
            onClick={onStop}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
