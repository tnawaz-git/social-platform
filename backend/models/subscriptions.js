const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  expireMonth:{ type: Number, required: true },
  expireYear:{ type: Number, required: true },
  planId: { type: mongoose.Types.ObjectId, required: true, ref: 'Plan' },
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
