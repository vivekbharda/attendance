var express = require('express');

var userController = require('../Controller/user.controller');

var router = express.Router();

// what will be the API to call , let us call the api for sign up ...
//for example = localhost:3000/user/sign
//for login = localhost:3000/user/login ... 
router.post('/signup' , userController.signUp); 
router.post('/login' , userController.login);
router.get('/get-users' , userController.getUsers);
router.post('/get-user-by-id' , userController.getUserById);
router.put('/update-user-by-id' , userController.updateUserById);
router.delete('/delete-user-by-id' , userController.deleteUserById); 

module.exports = router;