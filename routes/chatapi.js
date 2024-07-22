const express = require("express");
// const axios = require('axios');
const multer = require("multer");
const pdf = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const HistoryModel = require("../model/HistoryModel");
const os = require('os');
const Chatrouter = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(os.tmpdir(), 'Files');
    fs.mkdirSync(uploadPath, { recursive: true }); 
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

Chatrouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const extension = path.extname(filePath).slice(1).toLowerCase();
    const dataBuffer = fs.readFileSync(filePath);
    console.log({filePath, extension, dataBuffer});

    let data;
    if (extension === 'pdf') {
      const pdfData = await pdf(dataBuffer);
      data = pdfData.text;
    } else if (extension === 'html' || extension === 'txt') {
      data = fs.readFileSync(filePath, 'utf8');
    } else if (['docx', 'doc', 'docs'].includes(extension)) {
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      data = result.value;
    } else {
      return res.status(400).json({ error: 'Invalid file format' });
    }

    if (data) {
      res.send(data);
    } else {
      res.send(`Could not read the content of the ${extension} file.`);
    }
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({ error: 'File upload failed' });
  } finally {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
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
    res.status(500).json({ error: "History add failed" });
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
