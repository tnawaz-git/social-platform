const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  video: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  slotId: { type: mongoose.Types.ObjectId, required: true, ref: 'Slot' },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
});

module.exports = mongoose.model('Ad', adSchema);
