var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AttendenceSchema = new Schema({
	time: {type: String},
	userId: { type: Schema.Types.ObjectId , ref: 'User'},
	date: {type: String},
	status: {type: String , default: "absent"},
	diffrence: {type: String , default: "-"}, 
	timeLog: [{
		in : {type: String , default: null},
		out: {type: String , default: "-"},
		_id : false
	}],
	deviceName: {type: String , default: null}, 
	wifiName: {type: String},
	location : {
		type: {	type:  String , default: 'Point'},
		coordinates: [ Number]

	}
});
AttendenceSchema.index({location: "2dsphere"});
module.exports = mongoose.model('Attendence' , AttendenceSchema ); 
