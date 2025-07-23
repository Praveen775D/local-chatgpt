// --- Updated backend/controllers/chatController.js ---

const axios = require("axios");
const pool = require("../db/db");
require("dotenv").config();

// 1. Create a new chat
const createChat = async (req, res) => {
  try {
    const title = req.body.title || "New Chat";
    const result = await pool.query(
      "INSERT INTO chats (title) VALUES ($1) RETURNING *",
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create chat", details: err.message });
  }
};

// 2. Get all chats
const getChats = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM chats ORDER BY created_at DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to get chats", details: err.message });
  }
};

// 3. Get messages for a chat
const getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp ASC",
      [chatId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to get messages", details: err.message });
  }
};

// 4. Stream response from Ollama
const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;

  try {
    // Insert user message
    await pool.query(
      "INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)",
      [chatId, "user", message]
    );

    // Auto-title
    const titleCheck = await pool.query("SELECT title FROM chats WHERE id = $1", [chatId]);
    const existingTitle = titleCheck.rows[0]?.title;
    if (!existingTitle || existingTitle === "New Chat") {
      const shortTitle = message.split(" ").slice(0, 6).join(" ");
      await pool.query("UPDATE chats SET title = $1 WHERE id = $2", [shortTitle, chatId]);
    }

    // Setup streaming
    const ollamaResponse = await axios({
      method: "post",
      url: process.env.OLLAMA_API,
      responseType: "stream",
      data: {
        model: "llama3",
        prompt: message,
        stream: true,
      },
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let botReply = "";
    let lastToken = "";

    ollamaResponse.data.on("data", (chunk) => {
      const lines = chunk.toString().split("\n");
      lines.forEach((line) => {
        line = line.trim();
        if (!line) return;

        try {
          const json = JSON.parse(line);
          const token = json.response || "";
          if (token && token !== lastToken) {
            lastToken = token;
            botReply += token;
            res.write(`data: ${token}\n\n`);
          }
        } catch (err) {
          console.error("❌ JSON parse error in stream:", err.message);
        }
      });
    });

    ollamaResponse.data.on("end", async () => {
      await pool.query(
        "INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)",
        [chatId, "assistant", botReply]
      );
      res.end();
    });

    ollamaResponse.data.on("error", (err) => {
      res.status(500).end("Streaming error");
    });
  } catch (err) {
    console.error("❌ sendMessage error:", err.message);
    res.status(500).json({ error: "Failed to send message", details: err.message });
  }
};

// 5. Delete a chat
const deleteChat = async (req, res) => {
  const { chatId } = req.params;
  try {
    await pool.query("DELETE FROM messages WHERE chat_id = $1", [chatId]);
    await pool.query("DELETE FROM chats WHERE id = $1", [chatId]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete chat", details: err.message });
  }
};

// 6. Rename a chat
const renameChat = async (req, res) => {
  const { chatId } = req.params;
  const { title } = req.body;
  try {
    await pool.query("UPDATE chats SET title = $1 WHERE id = $2", [title, chatId]);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to rename chat", details: err.message });
  }
};

// Export all handlers
module.exports = {
  createChat,
  getChats,
  getChatMessages,
  sendMessage,
  deleteChat,
  renameChat,
};
