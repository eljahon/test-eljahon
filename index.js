const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cors = require('cors')
const authRoute = require("./routes/auth.router");
const app = express();
const PORT = config.get("serverPort");
app.use(cors())
app.use(express.json());
app.use("/api/auth", authRoute);
const start = async () => {
  try {
    await mongoose.connect(config.get("dbUrl"));
    app.listen(PORT, () => {
      console.log("server start on ports", PORT);
    });
  } catch (e) {}
};
start();
