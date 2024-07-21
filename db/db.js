const mongoose = require("mongoose");
require("dotenv").config();
const dburi = process.env.MONGODB_URL;
const Connection = mongoose.connect(dburi);

module.exports = Connection;
