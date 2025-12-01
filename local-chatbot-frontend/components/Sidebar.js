import { useState } from "react";

export default function Sidebar({ chats, onNewChat, onSelectChat, onDeleteChat, onRenameChat }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  return (
    <div className="w-64 bg-gray-900 text-white p-4 flex flex-col overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Local ChatGPT</h2>
      <button
        onClick={onNewChat}
        className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 mb-4"
      >
        + New Chat
      </button>

      <div className="flex-1">
        {chats.length === 0 && <p className="text-sm text-gray-400">No chats yet</p>}
        {chats.map((chat) => (
          <div key={chat.id} className="relative bg-gray-800 hover:bg-gray-700 rounded px-3 py-2 mb-2">
            <div onClick={() => onSelectChat(chat.id)} className="text-sm cursor-pointer">
              {chat.title || `Chat ${chat.id}`}
            </div>

            <div className="absolute top-2 right-2">
              <button onClick={() => setOpenMenuId(openMenuId === chat.id ? null : chat.id)}>
                ⋮
              </button>
              {openMenuId === chat.id && (
                <div className="absolute right-0 mt-2 w-28 bg-white text-black rounded shadow-md z-10">
                  <button
                    onClick={() => {
                      const newTitle = prompt("Enter new title", chat.title);
                      if (newTitle) onRenameChat(chat.id, newTitle);
                      setOpenMenuId(null);
                    }}
                    className="block px-3 py-2 hover:bg-gray-200 w-full text-left text-sm"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      onDeleteChat(chat.id);
                      setOpenMenuId(null);
                    }}
                    className="block px-3 py-2 hover:bg-red-100 w-full text-left text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
