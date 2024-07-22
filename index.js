const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 8080;
const app = express();
app.use(cors());
const Connection = require("./db/db");
const Chatrouter = require("./routes/chatapi");
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);
app.use(express.json());

app.get("/", async (req,res) => {
  res.send("Hello from Dudlin Server");
});

app.use("/chat", Chatrouter);

app.listen(port, async () => {
  console.log(`listening on ${port}`);
  try {
    Connection;
    console.log(`connected DB`);
  } catch (error) {}
});
