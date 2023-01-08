const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', usersController.getUsers);

router.get('/:uid', usersController.getSpecificUser);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.post('/login', usersController.login);

router.post('/bookmark/:pid/:uid', usersController.bookmarkPost);

router.post('/notification/:uid/:event', usersController.addNotifications);

router.delete('/notification/:uid', usersController.clearNotifications);

router.post('/verify/:uid', usersController.verifyAccount);

router.post('/saveVerificationDetails/:uid', usersController.saveVerificationDetails);

router.post('/users/pay', usersController.makePayment);

router.post('/users/subscribe/:uid/:planId', usersController.subscribeUser);

router.post('/users/message', usersController.sendMessage);

router.get('/users/message', usersController.getMessage);

router.post('/users/block/:uid', usersController.blockUser);

router.post('/users/mute/:uid', usersController.muteUser);

router.post('/users/report/:uid', usersController.reportUser);

router.post('/addPaymentMethod/:uid', usersController.addPaymentMethod);

router.get('/getAccessRights/:uid', usersController.getAccessRights);

router.get('/getUserByString/:subName', usersController.getUserByString);

module.exports = router;
