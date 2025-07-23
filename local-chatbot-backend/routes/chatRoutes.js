const express = require("express");
const router = express.Router();

const {
  createChat,
  getChats,
  getChatMessages,
  sendMessage,
  deleteChat,
} = require("../controllers/chatController");

router.post("/chat", createChat);
router.get("/chats", getChats);
router.get("/chat/:chatId", getChatMessages);
router.post("/chat/:chatId/message", sendMessage);
router.delete("/chat/:chatId", deleteChat);



module.exports = router;