var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var fs = require('fs-extra');
const moment = require('moment');
const lodash = require('lodash');
const cron = require('node-cron');
const crontab = require('node-crontab');
require("moment-duration-format");
const nodemailer = require('nodemailer');
var userRouter = require('./Routes/user');
var attendenceRouter = require('./Routes/attendence');

const attendeceModel = require('./models/attendence.model');
const userModel = require('./models/user.model');
const absentLogModel = require('./models/absentLog.model');

var app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



mongoose.connect('mongodb://localhost:27017/attendence', {useNewUrlParser: true})

.then(() => console.log("Connected"))
.catch(err => console.log(err));

app.use('/user', userRouter); 	
app.use('/attendence' , attendenceRouter);

//Cron job for sending email every two hour... 
	crontab.scheduleJob("0 * * * *" , function(){
	var currentTime = moment().format('h:mm:ss a');
	console.log("current Time ===========>" , currentTime);
	currentTime = moment(currentTime, 'hh:mm:ss: a').diff(moment().startOf('day'), 'seconds');
	console.log("current Time in seconds ===============++>" , currentTime);
	var mailOptions;
	var startPart = `<!DOCTYPE html>
	<html>
	<head>
	<title></title>
	</head>
	<body>	

	<table border cellpadding="15px" width="100%" >
	<tr style="background-color: silver;">
	<th >Name</th>
	<th>In/Out Time</th>
	<th>Working Hours</th>
	<th>Current Status</th>		
	</tr>`;

	var endPart = `</table></body></html>`;
	var trPart = null;
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'pushpraj4132@gmail.com',
			pass: 'livinggod13@'
		}
	});
	attendeceModel.find({date:  moment().format('L') })
	.populate('userId')
	.exec((err , foundData)=>{

		lodash.forEach(foundData , (singleData)=>{
			var timeLogLength = singleData.timeLog.length - 1;
			singleDataTime = moment(singleData.time , 'hh:mm:ss: a').diff(moment().startOf('day'), 'seconds');
			if(currentTime - singleDataTime > 900 ){
				singleData.timeLog[timeLogLength].out = singleData.time;
				singleData.status = "Absent";
			}
			else if(currentTime - singleDataTime == 900 ){
				singleData.timeLog[timeLogLength].out = "Check it time out manually ";
				singleData.status = "Cannot decide";
			}
			var str = `<table cellspacing="0"  cellpadding="7px" width="100%" >
			<tr style=" border-right: 1px solid black;" valign="top">
			<th>In</th>
			<th>Out</th>
			</tr>`;
			singleData.timeLog.forEach(function(arr){
				str += `<tr><td>`+arr.in+`</td><td>`+arr.out+`</td></tr>`; 
			});
			str += `</table>`;
			console.log("single data	 ===============>" , singleData);
			Part = `<tr style="text-align: center;"  valign="top">
			<td>`+singleData.userId.name+`</td>
			<td>`+str+`</td>
			<td>`+singleData.diffrence+`</td>
			<td>`+singleData.status+`</td>
			</tr>`;
			if(trPart == null){
				trPart = Part;
			}else{
				trPart = trPart + Part;
			}
			console.log("tr part =============================>" , trPart);
		});
		console.log("fianl trPart =============================>" , trPart);
		output = startPart + trPart + endPart;
		console.log("output *****************************************>" , output);
		mailOptions = {
			from: 'pushpraj4132@gmail.com',
			to: '160540107031@darshan.ac.in',
			subject: 'Sending Email using Node.js',
			html: output
		}
		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
				console.log("erooooooooooorrrrrr" , error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});
	} , {
		schedule: true,
		timezone: "Asia/kolkata"
	});
});

// for initializing the absent Schema
// Runs at 12am daily
// crontab.scheduleJob("*/10 * * * * *" , function(){
// 	userModel.find((err , foundEmployee)=>{
// 		presentDate = moment().format('L');
// 		console.log("found employee in cronjob ========>" , foundEmployee);
// 		lodash.forEach(foundEmployee , (singleEmployee)=>{
// 			body = {
// 				userId: singleEmployee._id,
// 				date: presentDate
// 			};
// 			var absentLog = new absentLogModel(body);
// 			absentLog.save((err , savedLog)=>{
// 				if(err)
// 					console.log("error in saving absent log of cron job =========>" , err);
// 				else
// 					console.log("success in saving absent log of cron job =========>" , savedLog);
// 			});
// 		})
// 	})
// } , {
// 	schedule: true,
// 	timezone: "Asia/kolkata"
// });


// cron job will send mail of attendence @1:30pm and 7:30pm
// crontab.scheduleJob("*/10 * * * * *" , function(){
// 	var arr = [];
// 	var  absentCount = 0;
// 	var  presentCount = 0;
// 	console.log("hiiiii");
// 	absentLogModel.find({})
// 	.populate('userId')
// 	.exec((err , foundRecord)=>{
// 		console.log(foundRecord);
// 		lodash.forEach(foundRecord , (singleRecord)=>{
// 			if(singleRecord.attendenceId == null){
// 				var info = {
// 					EmployeeName: singleRecord.userId.name,
// 					status :  "Absent"
// 				}
// 				arr.push(info);
// 				absentCount += 1;
// 			}
// 			else{
// 				var info = {
// 					EmployeeName: singleRecord.userId.name,
// 					status : "Present"
// 				}
// 				arr.push(info);
// 				presentCount += 1;
// 			}		

// 		});
// 		arr['present'] = presentCount;
// 		arr['absent'] = absentCount;
// 		console.log("Final array =======+++>" , arr);

// 		output = `<!DOCTYPE html>
// 			<html>
// 			<head>
// 			<title></title>
// 			</head>
// 			<body>	

// 			<table border cellpadding="15px" width="100%" >
// 			<tr style="background-color: silver;">
// 			<th >Name</th>
// 			<th>Status</th>
// 			</tr>`;

// 		var middlePart = `<tr><td><td></tr>`	
// 		var transporter = nodemailer.createTransport({
// 			service: 'gmail',
// 			auth: {
// 				user: 'pushpraj4132@gmail.com',
// 				pass: 'livinggod13@'
// 			}
// 		});
// 		mailOptions = {
// 			from: 'pushpraj4132@gmail.com',
// 			to: '160540107031@darshan.ac.in',
// 			subject: 'Sending Email using Node.js',
// 			html: 
// 		}
// 		transporter.sendMail(mailOptions, function(error, info){
// 			if (error) {
// 				console.log("erooooooooooorrrrrr" , error);
// 				sendEmail(name);
// 			} else {
// 				console.log('Email sent: ' + info.response);
// 			}
// 		});
// 	});	
// },{
// 	schedule: true,
// 	timezone: "Asia/kolkata"
// });



app.listen(3000);


