'use client';

export default function ChatWindow({ messages, onRetry }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white">
      {messages.map((msg, index) => (
        <div key={index} className="mb-4">
          <div className={`font-semibold ${msg.role === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
            {msg.role === 'user' ? 'You' : 'Bot'}
          </div>
          <div className={`text-gray-800 ${msg.role === 'assistant' ? 'animate-fadeIn' : ''}`}>
            {msg.content}
          </div>
          {msg.role === 'user' && (
            <button
              onClick={() => onRetry(msg.content)}
              className="text-sm text-gray-500 hover:underline mt-1"
            >
              Retry
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
