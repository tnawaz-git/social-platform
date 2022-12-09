const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: Number, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }],
  bookmarks:[{ type: mongoose.Types.ObjectId, required: true }],
  verificationDetails:
  {
    website: { type: String, required: false },
    document: { type: String, required: false },
    officialEmail: { type: String, required: false },
    newsArticles: [{ type: String, required: false }],
    googleTrendsProfile: { type: String, required: false },
    wikipediaLink: { type: String, required: false },
    instagramLink: { type: String, required: false },

  },
  verified:[{type: Boolean, required: true}],
  lastLogin: { type: Date, required: true },
  customerId: { type: String, required: true },
  planId: { type: mongoose.Types.ObjectId, required: true, ref: 'Plan'  },
  subscriptionId: { type: mongoose.Types.ObjectId, required: true, ref: 'Subscription' },
  messages:[{
    message_id: {type:mongoose.Types.ObjectId, required: true},
    read: {type: Boolean, required: true}
  }],
  paymentMethods:[{ type: mongoose.Types.ObjectId, required: true}],
  mutedUsers:[{type: mongoose.Types.ObjectId, required: true, ref: 'User'}],
  blockedUsers:[{type: mongoose.Types.ObjectId, required: true, ref: 'User'}],
  reportedUsers:[{type: mongoose.Types.ObjectId, required: true, ref: 'User'}]

});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
