const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messagesSchema = new Schema({
  text: { type: String, required: true },
  datetime: { type: Date, required: true },
  sent: { type: Boolean, required: true },
  seen: { type: Boolean, required: true },
  sender: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  recepient: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Message', messagesSchema);
