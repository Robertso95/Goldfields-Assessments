const mongoose = require('mongoose');

const learningSetSchema = new mongoose.Schema({
  _id: {
    type: Number,
    auto: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  parent: {
    type: Number,
  },
});

module.exports = mongoose.model('learningsets', learningSetSchema);