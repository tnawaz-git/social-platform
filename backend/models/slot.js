const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const slotSchema = new Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  bidder: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Slot', slotSchema);
