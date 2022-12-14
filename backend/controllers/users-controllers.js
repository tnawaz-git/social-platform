const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Subscription = require('../models/subscriptions');
const Message = require('../models/messages');
const Plan = require('../models/plan');
const access = require('access');

const ACCESS_LEVELS = {
  ADMIN: 0,
  USER: 1,
  GUEST: 2
};

// Set the default access level for all users
access.setDefaultLevel(ACCESS_LEVELS.GUEST);
access.grant(ACCESS_LEVELS.ADMIN, '/admin/*');

var Publishable_Key = '';
var Secret_Key = '';
 
const stripe = require('stripe')(Secret_Key)

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const getSpecificUser = async (req, res, next) => {
  const userId = req.params.pid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a user.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      'Could not find user for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, email, contact, username, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again.',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    contact,
    username,
    image: req.file.path,
    password: hashedPassword,
    places: [],
    bookmarks: [],
    verificationDetails: {
      website: "",
      document: "",
      officialEmail: "",
      newsArticles: [],
      googleTrendsProfile: "",
      wikipediaLink: "",
      instagramLink: ""
    },
    verified: false,
    lastLogin: new Date(),
    customerId: "",
    planId: "",
    subscriptionId: "",
    paymentMethods: [],
    mutedUsers:[],
    blockedUsers:[],
    reportedUsers:[],
    accessRight: ACCESS_LEVELS.USER
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.'+err,
      500
    );
    return next(error);
  }

  access.grant(ACCESS_LEVELS.USER, '/users/'+createdUser.id);

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};

const bookmarkPost = async (req, res, next) => {
  
  const placeId = req.params.pid;
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  user.bookmarks.push(placeId);

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not add bookmark.',
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const addNotifications = async (req, res, next) => {
  
  const interactorId = req.params.interactor;
  const userId = req.params.uid;
  const event = req.params.event;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  let interactor;
  try {
    interactor = await User.findById(interactorId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  user.notifications.push(interactor.name + " " + event + " your post");

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not add bookmark.',
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const clearNotifications = async (req, res, next) => {
  
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  user.notifications = [];

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not add bookmark.',
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const verifyAccount = async (req, res, next) => {
  
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }
  
  let today = new Date();

  if (user.newsArticles != [] 
    && user.verificationDetails.website != ""
    && user.verificationDetails.document != ""
    && user.verificationDetails.officialEmail != ""
    && user.verificationDetails.googleTrendsProfile != ""
    && user.verificationDetails.wikipediaLink != ""
    && user.verificationDetails.instagramLink != ""
    && user.contact != 0
    && user.username != ""
    && user.image != ""
    && user.email != ""
    && user.lastLogin > today.setMonth(today.getMonth() - 6)
  )
  {
    user.verified = true;
  }
  else
  {
    user.verified = false;
  }

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not verify account.',
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const saveVerificationDetails = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { website, document, officialEmail, newsArticles, googleTrendsProfile, wikipediaLink, instagramLink} = req.body;

  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

    user.verificationDetails.website = website;
    user.verificationDetails.document = document;
    user.verificationDetails.newsArticles = [newsArticles];
    user.verificationDetails.googleTrendsProfile = googleTrendsProfile;
    user.verificationDetails.wikipediaLink = wikipediaLink;
    user.verificationDetails.instagramLink = instagramLink;

    let today = new Date();

  if (user.verificationDetails.newsArticles != [] 
    && user.verificationDetails.website != ""
    && user.verificationDetails.document != ""
    && user.verificationDetails.officialEmail != ""
    && user.verificationDetails.googleTrendsProfile != ""
    && user.verificationDetails.wikipediaLink != ""
    && user.verificationDetails.instagramLink != ""
    && user.contact != 0
    && user.username != ""
    && user.image != ""
    && user.email != ""
    && user.lastLogin > today.setMonth(today.getMonth() - 6)
  )
  {
    user.verified = true;
  }
  else
  {
    user.verified = false;
  }

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Verification request failed, please try again later.'+err,
      500
    );
    return next(error);
  }
  
  res.status(200).json({ user: user.toObject({ getters: true }) });
};


const makePayment = async (req, res, next) => {
  
  const userId = req.body.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  if (user.customerId == "")
  {
  stripe.customers.create({
  email: user.email,
  //source: req.body.stripeToken,
  name: user.name,
  })
  .then(async (customer) => {
  user.customerId = customer.id;
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Customer creation failed, please try again later.',
      500
    );
    return next(error);
  }

  return stripe.charges.create({
  amount: req.body.amount, 
  description: 'Payment',
  currency: 'USD',
  customer: customer.id
  });
  })
  .then((charge) => {
  res.send("Success") // If no error occurs
  })
  .catch((err) => {
  res.send(err) // If some error occurs
  });
  }

  else
  {
    return stripe.charges.create({
      amount: req.body.amount, 
      description: 'Payment',
      currency: 'USD',
      customer: user.customerId
      })
      .then((charge) => {
        res.send("Success") // If no error occurs
        })
        .catch((err) => {
        res.send(err) // If some error occurs
        });
  }
};

const subscribeUser = async (req,res,next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  const reqPlanId = req.params.planId;
  user.planId = reqPlanId;
  let plan;
  try {
    plan = await Plan.findById(reqPlanId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find plan.',
      500
    );
    return next(error);
  }

  let currDate = new Date();
  
  const newSubscription = new Subscription({
    title: plan.title,
    description: plan.description,
    date: currDate,
    expireMonth: currDate.setMonth(currDate.getMonth +plan.duration),
    expireYear: currDate.getFullYear(),
    planId: reqPlanId,
    userId: user.id
  });

  try {
    await newSubscription.save();
  } catch (err) {
    const error = new HttpError(
      'Subscription failed, please try again later.'+err,
      500
    );
    return next(error);
  }

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'User updation failed, please try again later.',
      500
    );
    return next(error);
  }

  res.status(200).json({ newSubscription: newSubscription.toObject({ getters: true }) });

};

const sendMessage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  let user;
  try {
    user = await User.findById(sender);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  const { text, sender, recepient } = req.body;

  const newMessage = new Message({
    text: text,
    datetime: new Date(),
    sent: true,
    seen: false,
    sender: sender,
    recepient: recepient
  });

  try {
    await newMessage.save();
  } catch (err) {
    const error = new HttpError(
      'Message could not be sent.',
      500
    );
    return next(error);
  }

  sender.messages.push({"message_id":newMessage.id, "seen":false})

  try {
    await sender.save();
  } catch (err) {
    const error = new HttpError(
      'Message could not be sent.',
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ messageId: newMessage.id});
};

const getMessage = async (req, res, next) => {
  const userId = req.body.userId;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find message.',
      500
    );
    return next(error);
  }

  res.json({ messages: user.messages });
};

const blockUser = async (req, res, next) => {
  const blockedUserId = req.body.bUserId;
  const userId = req.params.uid;

  let user;
  let blockedUser;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  try {
    blockedUser = await User.findById(blockedUserId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  user.blockedUsers.push(blockedUser);
  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'User could not be saved',
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const reportUser = async (req, res, next) => {
  const reportedUserId = req.body.bUserId;
  const userId = req.params.uid;

  let user;
  let reportedUser;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  try {
    reportedUser = await User.findById(reportedUserId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  user.reportedUsers.push(reportedUser);
  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'User could not be saved',
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const muteUser = async (req, res, next) => {
  const muteUserId = req.body.bUserId;
  const userId = req.params.uid;

  let user;
  let mutedUser;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  try {
    mutedUser = await User.findById(muteUserId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  user.mutedUsers.push(mutedUser);
  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'User could not be saved',
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const addPaymentMethod = async (req, res, next) => {
  const paymentMethodObject = req.body.paymentMethod;
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  user.paymentMethods.push(paymentMethodObject);
  
  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'User could not be saved',
      500
    );
    return next(error);
  }

  try {
    // Collect the payment method details from the request
    const payMethod = req.body.paymentMethod;
    const customer = user.customerId;

    // Attach the payment method to the customer
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethod, {
      customer: customer
    });

    res.send({ paymentMethod });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const getAccessRights = async (req,res,next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }
  res.status(201).json({ accessRight: user.accessRight });
};




exports.getUsers = getUsers;
exports.getSpecificUser= getSpecificUser;
exports.signup = signup;
exports.login = login;
exports.bookmarkPost = bookmarkPost;
exports.addNotifications = addNotifications;
exports.clearNotifications = clearNotifications;
exports.verifyAccount = verifyAccount;
exports.saveVerificationDetails = saveVerificationDetails;
exports.makePayment = makePayment;
exports.subscribeUser = subscribeUser;
exports.getMessage = getMessage;
exports.sendMessage = sendMessage;
exports.blockUser = blockUser;
exports.muteUser = muteUser;
exports.reportUser = reportUser;
exports.addPaymentMethod = addPaymentMethod;
exports.getAccessRights = getAccessRights;

