var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');


var app = express();

//define Database component 

mongoose.connect('mongodb://localhost:27017/attendence' , { useNewUrlParse: true })
.then(() => console.log("connected"))
.catch(err => console.log(err));

var userRouter = require('./Routes/user');


//all Controller routes are defines here 

app.use('/user' , userRouter);

app.listen(3000);

module.exports = app;