const mongoose = require("mongoose");

const countersSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  sequence: {
    type: Number,
  },
});

module.exports = mongoose.model("counters", countersSchema);
