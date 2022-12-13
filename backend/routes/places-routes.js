const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:pid/:uid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.get('/bookmarks/:uid', placesControllers.getBookmarksByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

router.post('/like/:pid/:uid', placesControllers.likePost);

router.post('/comment/:pid/:uid', placesControllers.commentPost);

router.post('/share/:pid/:uid', placesControllers.sharePost);

router.get('/trends', placesControllers.getTrends);

router.post('/streamVideo', placesControllers.streamVideo);

router.post('/performModeration/:pid', placesControllers.moderate)

module.exports = router;
