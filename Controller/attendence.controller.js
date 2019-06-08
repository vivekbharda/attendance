const attendenceModel = require('../models/attendence.model');
const userModel = require('../models/user.model');
const absentLogModel = require('../models/absentLog.model');

const attendenceController = {};
const nodemailer = require('nodemailer');
const moment = require('moment');
const lodash = require('lodash');
const cron = require('node-cron');
const crontab = require('node-crontab');
require("moment-duration-format");


attendenceController.fillAttendence = function(req , res){
	console.log("req body of fill attendence " , req.body);
	presentDate = moment().format('L');	
	console.log("req.body.previousTimeLog =========+>", req.body.previousTimeLog.date == null);
	if(req.body.previousTimeLog.date != null && req.body.previousTimeLog.time != null){
		console.log("req.body.previousLogTime.date ====>" , req.body.previousTimeLog.date);
		attendenceModel.findOne({userId: req.body.userId , date: req.body.previousTimeLog.date} , (err , foundLog)=>{
			if(err){
				res.status(404).send(err);
			}
			else if(foundLog == null){
				res.status(500).send("Your Previous Log is not valid");
			}
			else{
				console.log("updated lOg ========+>" , foundLog);
				var lastLog = foundLog.timeLog.length - 1;
				foundLog.timeLog[lastLog].out = req.body.previousTimeLog.time;
				foundLog = calculateDiffrence(foundLog , lastLog);


				attendenceModel.findOneAndUpdate({userId: req.body.userId , date: req.body.previousTimeLog.date} , {$set: foundLog} ,{upsert:true , new: true})
				.exec((err , updatedLog)=>{
					if(err){
						res.status(404).send(err);
					}
					else{
						console.log("updated lOg ========+>" , updatedLog);
					}
					attendenceCallBackFunction();
				});
			}
		});
	}
	else{
		attendenceModel.find({userId: req.body.userId})
		.populate('userId')
		.sort({_id: -1})
		.limit(1)
		.exec((err , foundLog)=>{
			console.log("foundLog =====> " , foundLog.length);
			if(err){
				res.status(404).send(err);
			}
			else if(foundLog.length == 0){
				newAttendence();
			}
			else{

				console.log("In the else part if previous log is not given");
				console.log("found log initially ====================+>" , foundLog);
				var timeLogLength = foundLog[0].timeLog.length - 1;
				var lastRecord = foundLog[0].timeLog[timeLogLength].out;	
			// res.send(lastRecord);
			var symbol = "-";
			console.log("last record =======>",lastRecord != symbol);
			if(lastRecord !="-"){
				res.send("Out time of last Log is already inserted ,'*** ERROR ***' ");
			}
			else{
				foundLog[0].timeLog[timeLogLength].out = foundLog[0].time;
				foundLog = calculateDiffrence(foundLog[0] , timeLogLength);
				console.log("found log =-====================>" , foundLog);
				var email = foundLog.userId.email;
				var message = ", its a warning for you not to clear the Data of the App . For More Information meet to Higher Authorities";
				sendEmail(foundLog.userId.name , message , email);
				attendenceModel.findOneAndUpdate({date: foundLog.date , userId: foundLog.userId._id} , {$set: foundLog} , {upsert: true , new: true} , (err , updatedLog)=>{
					if(err){
						res.status(500).send(err);
					}
					else{
						console.log("Previous log is ssaved even though the previous log is not given");
						attendenceCallBackFunction();
					}
				});
				// res.send(foundLog);
			}
		}
		});
	}
	
	function attendenceCallBackFunction() {
		userModel.findOne({_id : req.body.userId} , (err , foundUser)=>{
			console.log("found user");
		// res.send(foundUser);
		if(err){
			console.log("error  in finding student" , err);
			res.status(400).send(err);
		}
		else{
			console.log("working");
			attendenceModel.findOne({userId: req.body.userId , date: presentDate})
			.populate('userId')
			.exec((err , foundAttendence)=>{
				if(err){
					res.status(500).send(err);
				}
				else if(foundAttendence != null){
					console.log("null");
					foundAttendence.location.coordinates = req.body.location.coordinates;
					/*var timeLogLength = foundAttendence.timeLog.length - 1;
					var lastRecord = foundAttendence.timeLog[timeLogLength].out;
					console.log("last recoed ====>" , lastRecord);
					if(lastRecord == "-"){
						foundAttendence.timeLog[timeLogLength].out = moment().format('h:mm:ss a');

						time = foundAttendence.timeLog[timeLogLength].out;
						// updateAbsentLogRecord(foundAttendence , time);
						foundAttendence = calculateDiffrence(foundAttendence , timeLogLength);
						attendenceModel.findOneAndUpdate({_id: foundAttendence._id} , {$set: foundAttendence} , {upsert: true, new: true} , (err , updatedAttendence)=>{
							if(err){
								res.status(500).send(err);
							}
							else{
								console.log(updatedAttendence);
								res.status(200).send(updatedAttendence);
							}
						})

					}*/
					
					console.log("foundAttendence.deviceName != req.body.deviceName ==============>" , foundAttendence.deviceName != req.body.deviceName);
					if(foundAttendence.deviceName != req.body.deviceName){
						message = " Logged-In from unauthorized Device ";
						email = "160540107031@darshan.ac.in";
						sendEmail(foundAttendence.userId.name , message , email);
					}
					presentTime = moment().format('h:mm:ss a'); 
					var arr = {
						in :  presentTime
					};
					foundAttendence.status = "Present";
					foundAttendence.timeLog.push(arr);
					foundAttendence.deviceName = req.body.deviceName;
					attendenceModel.findOneAndUpdate({_id: foundAttendence._id} , {$set: foundAttendence} , {upsert: true, new: true} , (err , updatedAttendence)=>{
						if(err){
							res.status(500).send(err);
						}else{
							res.status(200).send(updatedAttendence);
						}

					});
						/*absentLogModel.findOne({userId: foundAttendence.userId , date: presentDate} , (err , foundAbsentLogRecord)=>{
							if(foundAbsentLogRecord != null){
								var lastLog = foundAbsentLogRecord.absentPeriodLog.length - 1;
								if(lastLog < 0){
									console.log("do nothing");
								}
								else{
									foundAbsentLogRecord.absentPeriodLog[lastLog].to = presentTime;
									foundAbsentLogRecord = calculateAbsentLogDifference(foundAbsentLogRecord , lastLog);
									absentLogModel.findOneAndUpdate({_id: foundAbsentLogRecord._id} , {$set: foundAbsentLogRecord} , {upsert: true ,new: true} , (err , updatedAbsentLogRecord)=>{
										if(err){
											res.status(500).send(err);
										}
										else
											console.log(" updatedAbsentLogRecord ================>" , updatedAbsentLogRecord);	
									});
								}
							}
						});*/

					}
				else{
					newAttendence();
				}
			});
		}
		});
	}
	
	function newAttendence(){
		req.body = {
			time: moment().format('h:mm:ss a'),
			deviceName: req.body.deviceName,
			status: "Present",
			userId : req.body.userId,
			name : req.body.name,
			date : presentDate,
			location : req.body.location,
			wifiName: req.body.wifiName,
			timeLog : {
				in : moment().format('h:mm:ss a')
			}
		}
		console.log("proper working =======> body " , req.body);
		var attendence = new attendenceModel(req.body);
		attendence.save((err , savedAttendence)=>{
			if(err){
				res.status(500).send(err);
			}
			else{
				/*absentLogModel.findOneAndUpdate({userId: savedAttendence.userId , date: moment().format('L')} , {attendenceId: savedAttendence._id} , {upsert: true,new: true}) 
							// .populate('attendenceId userId')
							.exec((err , updatedAbsentLog)=>{
								if(err)
									res.send(err);
								else
									console.log("console of updatedAbsentLog =======================>" , updatedAbsentLog);

							});
							userModel.findOne({_id: savedAttendence.userId})
							.exec((err , foundUser)=>{
								if(foundUser.deviceName != savedAttendence.deviceName){
									sendEmail(foundUser.name);
								}
				});*/
				console.log(savedAttendence);
				res.status(200).send(savedAttendence);

			}
		});
	}
}
function sendEmail(name , message , email){
	console.log("send email ***NAME ====>" , name , " ******MESSAGE =====>" , message , "*************email ==> " , email);
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'pushpraj4132@gmail.com',
			pass: 'livinggod13@'
		}
	});
	mailOptions = {
		from: 'pushpraj4132@gmail.com',
		to: email,
		subject: 'Sending Email using Node.js',
		text: name + message
	}
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log("erooooooooooorrrrrr" , error);
			sendEmail(name , message , email);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
}

/*function calculateAbsentLogDifference(foundAbsentLog , timeLogLength){
	var in1 = foundAbsentLog.absentPeriodLog[timeLogLength].from;
	var out = foundAbsentLog.absentPeriodLog[timeLogLength].to;
	var inn =  moment(in1, 'hh:mm:ss: a').diff(moment().startOf('day'), 'seconds');		
	var outt =  moment(out, 'hh:mm:ss: a').diff(moment().startOf('day'), 'seconds');		
	console.log("in time ==>", in1 , " seconsds ===>" , inn);
	console.log("out time ==>", out , "seconsds==>" , outt);
	seconds = outt - inn;
	if(foundAbsentLog.absentDuration != null){
		var absentDuration = moment(foundAbsentLog.absentDuration, 'hh:mm:ss: a').diff(moment().startOf('day'), 'seconds'); 	
		console.log("absentDuration ======>" , absentDuration);
		seconds = seconds + absentDuration;
	}
	console.log("seconds ====>" , seconds);
	seconds = Number(seconds);
	var h = Math.floor(seconds / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 3600 % 60);

	var time =  ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);

	console.log("time ==========+>"  , time);
	foundAbsentLog.absentDuration = time;

	return foundAbsentLog;
}*/


function calculateDiffrence(foundAttendence , timeLogLength){
	console.log("**************************** " , foundAttendence);
	var in1 = foundAttendence.timeLog[timeLogLength].in;
	var out = foundAttendence.timeLog[timeLogLength].out;
	var inn =  moment(in1, 'hh:mm:ss: a').diff(moment().startOf('day'), 'seconds');		
	var outt =  moment(out, 'hh:mm:ss: a').diff(moment().startOf('day'), 'seconds');		
	console.log("in time ==>", in1 , " seconsds ===>" , inn);
	console.log("out time ==>", out , "seconsds==>" , outt);
	seconds = outt - inn;
	if(foundAttendence.diffrence != "-"){
		var diffrence = moment(foundAttendence.diffrence, 'hh:mm:ss: a').diff(moment().startOf('day'), 'seconds'); 	
		console.log("diffrence ======>" , diffrence);
		seconds = seconds + diffrence;
	}
	console.log("seconds ====>" , seconds);
	seconds = Number(seconds);
	var h = Math.floor(seconds / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 3600 % 60);

	var time =  ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);

	console.log("time ==========+>"  , time);
	foundAttendence.diffrence = time;
	foundAttendence.status = "Absent";
	return foundAttendence;
}

attendenceController.getTodaysAttendenceByDate = function(req , res){
	console.log("req body of getTodaysAttendenceByDate ========>", req.body);
	attendenceModel.find({date: req.body.date} , (err , foundRecords)=>{
		if(err){
			res.send(500).send(err);
		}
		else if(foundRecords.length == 0){
			console.log("hii");
			var response = "either holiday or no records found";
			res.status(200).send(response);
		}
		else{
			res.status(200).send(foundRecords);
		}
	});	
}
attendenceController.getTodaysAttendenceByDateAndId = function(req , res){
	
	
}
function addTime(time){

	console.log("hello in add time function ");
	var minutes = 15;
	// var exit = moment().format('h:mm:ss a');
	 var updatedTime = moment(time, "hh:mm:ss a")
        .add(minutes, 'minutes')
        .format('h:mm:ss a');
	console.log("return Date ===> " , updatedTime);
	return updatedTime;
}


attendenceController.checkAttendenceIntervalVise = function(req , res){
	// var api = req
	// console.log("ype of req.body ==> " , typeof req.body);
	if(typeof req.body == "object"){
		var api = [];
		api.push(req.body);
		req.body = api; 
	}
	
	console.log("request body =====================> " , req.body);
// console.log(req.body)

	flag = 1;
	presentDate = moment().format('L');
	presentTime = moment().format('h:mm:ss a');
	console.log("presentDate ========>" , presentDate);
	if(!req.body.length <= 1){
		console.log("in if");
		attendenceModel.findOne({userId: req.body[0].userId})
		.exec((err , foundLog)=>{
			console.log("found log ============================>"  , foundLog);
			time = foundLog.time;
			foundLog.time =   addTime(time);
			foundLog.location.coordinates = req.body[0].location.coordinates;
			foundLog.deviceName = req.body[0].deviceName;
			foundLog.wifiName = req.body[0].wifiName;
			attendenceModel.findOneAndUpdate({userId: foundLog.userId} , foundLog , {upsert: true , new: true} , (err , savedLog)=>{
				if(err){
					res.status(500).send(err);
				}else{
					console.log("savedLoged ===========================>" , savedLog);
					console.log("20000");
					message = "Updated Successfully";
					res.json({
						message: "Updated Successfully"
					});
				}
			});
		});
	}
	else{
		console.log("in else");

		attendenceModel.find({ date:  presentDate},(err , foundData)=>{
			if(err){
				res.send(err);
			}
			else if(foundData == null){
				res.send("enter valid credential");
			}
			else{
				console.log("foundData of todays present Employee =======>" , foundData);
				lodash.forEach(foundData , (singleEmployeeData)=>{
					lodash.forEach(req.body , (singleReqestedEmployeeData)=>{
						if(singleReqestedEmployeeData.userId == singleEmployeeData.userId){
							flag = 0;
							console.log("flag turns into 0");
							time = singleEmployeeData.time;
							singleEmployeeData.time = addTime(time);	
							singleEmployeeData.location.coordinates =  singleReqestedEmployeeData.location.coordinates;
							singleEmployeeData.deviceName = singleReqestedEmployeeData.deviceName;
							attendenceModel.findOneAndUpdate({_id: singleEmployeeData._id} , {$set: singleEmployeeData} , {upsert: true, new: true} , (err , updatedresponse)=>{
								if(err)
									res.status(500).send(err);
								else if(updatedresponse == null){
									res.send("no data found and updated");
								}
								else{
									// res.send("Updated")
									console.log("Coordinates are updated");
								} 
							});

						}
					});
				/*if(flag == 1){
					console.log("working proper");
					var lastLog = singleEmployeeData.timeLog.length - 1;
					console.log("last log ===========>" , lastLog);
					console.log("singleEmployeeData.timeLog[lastLog].out == null ========>" , singleEmployeeData.timeLog[lastLog].out);
					if(singleEmployeeData.timeLog[lastLog].out == "-"){
						console.log("proper inside the null part");
					//update attendence model
					singleEmployeeData.timeLog[lastLog].out = presentTime;
					singleEmployeeData = calculateDiffrence(singleEmployeeData , lastLog);
					attendenceModel.findOneAndUpdate({userId: singleEmployeeData.userId , date: presentDate} , {$set: singleEmployeeData} , {upsert: true,new: true} , (err , updatedAttendence)=>{
						console.log("**PROUD OF YOU PUSHPRAJ**");	
						console.log("attendence updated of =====>" , singleEmployeeData.userId);
					});
					//update AbsentLog Model
					updateAbsentLogRecord(singleEmployeeData , presentTime);
					
					}
				}*/
				// flag = 1;
				console.log("heloooooooo i m here");
			});
				message = "You are upto-date";
				res.status(200).send(message);
			}

		});
	}
}

/*function updateAbsentLogRecord(singleEmployeeData , presentTime){
	absentLogModel.findOne({userId: singleEmployeeData.userId , date: moment().format('L')})
	.exec((err , foundAbsentLog)=>{
		console.log("founded absent log =========>" , foundAbsentLog.absentPeriodLog.length);
		if(foundAbsentLog.absentPeriodLog.length == 0){
			foundAbsentLog = {
				
				absentPeriodLog : {
					from: presentTime
				},
				absentCounts : foundAbsentLog.absentCounts + 1,
			}
			console.log("foundAbsentLog =======>" , foundAbsentLog);
			absentLogModel.findOneAndUpdate({userId: singleEmployeeData.userId} , {$set: foundAbsentLog} , {upsert: true,new: true})
			.populate('attendenceId userId')
			.exec((err , updatedAbsentLog)=>{
				// res.send(updatedAbsentLog);
				console.log("goiinfg to the as t  1111");
				// return updatedAbsentLog;
				// callback(updatedAbsentLog);
			})
		}
		else{
			var arr = {
				from :  presentTime
			};
			foundAbsentLog.absentPeriodLog.push(arr);
			absentLogModel.findOneAndUpdate({_id: foundAbsentLog._id} , {$set: foundAbsentLog} , {upsert: true, new: true}) 
			.populate('attendenceId userId')
			.exec((err , updatedAbsentLog)=>{
				if(err){
					res.status(500).send(err);
				}else{
					console.log("goiinfg to the ast");

					// return updatedAbsentLog;
					// callback(updatedAbsentLog);
					// res.send(updatedAbsentLog);
				}
			});
		}
	});
}*/

attendenceController.getAllAbsentLogRecords = function(req , res){
	attendenceModel.find()
	.populate('userId')
	.exec((err , foundLogs)=>{
		if(err){
			res.send(err);
		}
		else{
			res.send(foundLogs);
		}
	});
}


module.exports = attendenceController;