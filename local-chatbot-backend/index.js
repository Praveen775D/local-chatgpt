const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", chatRoutes);  // ✅ This is where error is triggered if chatRoutes is wrong

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
