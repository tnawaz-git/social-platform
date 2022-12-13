const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const NodeGeocoder = require('node-geocoder');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const http = require('http');
const AWS = require('aws-sdk');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  const userId = req.params.uid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find place for the provided id.',
      404
    );
    return next(error);
  }

// Set up options for the geocoder
const options = {
  provider: 'google',
  apiKey: 'your-google-maps-api-key',
};

// Create an instance of the geocoder
const geocoder = NodeGeocoder(options);
let geoCity = "";
let geoCountry = "";

// Geocode the user's location
geocoder.geocode(req.socket.remoteAddress)
  .then((results) => {
    // results[0] contains the user's city and country
    city = results[0].city;
    country = results[0].country;
  })
  .catch((error) => {
    // Handle any errors that may have occurred
    return next(error);
  });


  place.views.push(
    {
      "user": userId,
      "location":{
        lat:0,
        lng:0,
        city: geoCity,
        country: geoCountry
      },
      "datetime": new Date()
    }
  )

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not add view of post.',
      500
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

const getBookmarksByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithBookmarks;
  try {
    userWithBookmarks = await User.findById(userId).populate('bookmarks');
  } catch (err) {
    const error = new HttpError(
      'Fetching bookmarks failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!userWithBookmarks || userWithBookmarks.bookmarks.length === 0) {
    return next(
      new HttpError('Could not find bookmarks for the provided user id.', 404)
    );
  }

  res.json({
    bookmarks: userWithBookmarks.bookmarks.map(bookmark =>
      bookmark.toObject({ getters: true })
    )
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description} = req.body;

  // let coordinates;
  // try {
  //   coordinates = await getCoordsForAddress(address);
  // } catch (error) {
  //   return next(error);
  // }

  const createdPlace = new Place({
    title,
    description,
    image: req.file.path,
    creator: req.userData.userId,
    likes: [],
    comments: []
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this place.', 401);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this place.',
      401
    );
    return next(error);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted place.' });
};

const likePost = async (req, res, next) => {
  
  const userid = req.params.uid;
  const placeid = req.params.pid;
  
  let place;
  let user;
  try {
    place = await Place.findById(placeid);
    user = await User.findById(userid);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  if (!place.likes.includes([user.name, userid])) 
    place.likes.push([user.name, userid]);
  

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not add like.',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const commentPost = async (req, res, next) => {

  const userid = req.params.uid;
  const placeid = req.params.pid;

  let place;
  let user;
  try {
    place = await Place.findById(placeid);
    user = await User.findById(userid);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find user.',
      500
    );
    return next(error);
  }

  let date_ob = new Date();

// current date
let date = ("0" + date_ob.getDate()).slice(-2);

// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
let year = date_ob.getFullYear();

// current hours
let hours = date_ob.getHours();

// current minutes
let minutes = date_ob.getMinutes();

// current seconds
let seconds = date_ob.getSeconds();

// prints date & time in YYYY-MM-DD HH:MM:SS format
let timestamp = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;


  place.comments.push(["Test Comment",userid,user.name,timestamp]);

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not add comment.',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const sharePost = async (req, res, next) => {
  
  const userid = req.params.uid;
  const placeid = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeid);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not share place.',
      500
    );
    return next(error);
  }

  const createdPlace = place;

  let user;
  try {
    user = await User.findById(userid);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  if (user.places.includes(createdPlace))
  {
    const error = new HttpError('Place already exists on the newsfeed', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });    
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const getTrends = async () => {
  let postArray =[];
  Place.find({} , (err, posts) => {
    if(err){
      const error = new HttpError(
        'Something went wrong. Please try again',
        500
      );
      return next(error);
    }   
    posts.map(post => {
        postArray.push([post.id,posts.views.length])
    })
})

let sortedArray=[];
if (postArray.length>10){
sortedArray = postArray.sort(function(a, b) { return b; }).reverse().slice(0,10);
}
let trends = [];
for (const trend of sortedArray){
  let place;
  try {
    place = await Place.findById(trend[0]);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find post.',
      500
    );
    return next(error);
  }
  trends.push(place);
}

res.status(201).json({ topTenTrends: trends });

};

const streamVideo = async (req, res, next) => {
const filePath = req.body.filePath;

const server = http.createServer((req, res) => {
  // Use the fs module to read the file from the file system
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If there was an error reading the file, send a 404 response
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }

    // Set the content type of the response to be video/mp4
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    res.end(data);
  });
});

server.listen(3000);
};

const moderate = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  AWS.config.update({
    region: 'REGION',
    accessKeyId: 'ACCESS_KEY',
    secretAccessKey: 'SECRET_KEY'
  });
  const rekognition = new AWS.Rekognition();

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find post.',
      500
    );
    return next(error);
  }
  
  const params = {
    Image: place.image,
    MinConfidence: 90 // Specify the minimum confidence level (in percent) that you want to use as the threshold for moderation.
  };
  
  rekognition.detectModerationLabels(params, function(err, data) {
    if (err) {
      // Handle error
    } else {
      // Use the data to determine whether the image or video contains any inappropriate content
      if (data[0]["Confidence"] > 90)
      {
        res.status(201).json({ "safe": false });
      }
      else{
        res.status(201).json({ "safe": true });
      }
    }
  });
  
  

};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.getBookmarksByUserId = getBookmarksByUserId;
exports.createPlace = createPlace;
exports.sharePost = sharePost;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.likePost = likePost;
exports.commentPost = commentPost;
exports.getTrends = getTrends;
exports.streamVideo = streamVideo;
exports.moderate = moderate;
