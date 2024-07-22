const express = require("express");
// const axios = require('axios');
const multer = require("multer");
const pdf = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const HistoryModel = require("../model/HistoryModel");
const Chatrouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/Files"),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

Chatrouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    let path = req.file.path;
    let extension = path.split(".").pop().toLowerCase();
    let data = "";
    let dataBuffer = fs.readFileSync(req.file.path);
    fs.unlinkSync(req.file.path);
    if (extension === "pdf") {
      data = await pdf(dataBuffer);
      if(data.text) res.send(data.text);
      else
        res.send(
          "Image pff file can't be read please provide a text contain pdf file"
        );
    } else if (extension === "html") {
      data = fs.readFileSync(req.file.path, "utf8");
      let checkData = data.split("\n").join("");
      if (checkData) res.send(data);
      else
        res.send(
          "Image html file can't be read please provide a text contain html file"
        );
    } else if (["docx", "doc", "docs"].includes(extension)) {
      const { value } = await mammoth.extractRawText({ buffer: dataBuffer });
      let checkData = value.split("\n").join("");
      if (checkData) res.send(value);
      else
        res.send(
          "Image doc file can't be read please provide a text contain doc file"
        );
    } else if (extension === "txt") {
      data = fs.readFileSync(req.file.path, "utf8");
      let checkData = value.split("\n").join("");
      if (checkData) res.send(value);
      else
        res.send(
          "Image txt file can't be read please provide a text contain txt file"
        );
    } else {
      return res.status(400).json({ error: "Invalid file format" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Chatrouter.post("/history", async (req, res) => {
  const { data, chatId } = req.body;
  let saveData;
  try {
    if (chatId) {
      saveData = await HistoryModel.updateOne({ chatId, data: data?.data });
      res.json({ message: "Data modified successfully", data: saveData });
    } else {
      saveData = await HistoryModel(data);
      saveData.save();
      res.json({ message: "Data saved successfully", data: saveData });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Chatrouter.get("/Allhistory/:email", async (req, res) => {
  const email = req.params.email;
  if (!email) return res.status(400).json({ error: "Invalid ID" });

  try {
    const savedData = await HistoryModel.find({ userId: email });
    res.json({ message: "Data retrieved successfully", data: savedData });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
Chatrouter.get("/history/:id", async (req, res) => {
  const id = req.params.id;
  console.log({id});
  if (!id) return res.status(400).json({ error: "Invalid ID" });

  try {
    const savedData = await HistoryModel.findById(id);
    res.json({ message: "Data retrieved successfully", data: savedData });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
Chatrouter.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Invalid ID" });

  try {
    const savedData = await HistoryModel.findByIdAndDelete(id);

    res.json({ message: "Data Deleted successfully", data: savedData });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = Chatrouter;
