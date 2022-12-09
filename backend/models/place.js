const mongoose = require('mongoose');
const { array } = require('../middleware/file-upload');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  // address: { type: String, required: true },
  // location: {
  //   lat: { type: Number, required: true },
  //   lng: { type: Number, required: true }
  // },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  likes: [[{ type: String, required: true }, { type: mongoose.Types.ObjectId, required: true },]],
  comments: [[{ type: String, required: true },{ type: mongoose.Types.ObjectId, required: true},{ type: String, required: true},{type: String, required: true}]]
});

module.exports = mongoose.model('Place', placeSchema);
