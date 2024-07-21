const mongoose = require("mongoose");

const HistorySchema = mongoose.Schema(
  {
    data: [],
    userId: {
      type: String,
      default: "abc@gmail.com",
      required: true,
      trim: true,
    },
    chatId: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
  },
  {
    timeStamp: true,
  }
);

const HistoryModel = mongoose.model("History", HistorySchema);

module.exports = HistoryModel;
