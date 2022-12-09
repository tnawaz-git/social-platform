const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const planSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  creatorPortal: { type: Boolean, required: true },
  businessPortal: { type: Boolean, required: true },
});

module.exports = mongoose.model('Plan', planSchema);
