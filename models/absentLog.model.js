var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AbsentLogSchema = new Schema({
	userId: { type: Schema.Types.ObjectId , ref: 'User' },
	attendenceId: { type: Schema.Types.ObjectId , ref: 'Attendence' , default: null},
	date: {type: String},
	absentDuration: {type: String , default: null},
	absentCounts: {type: Number , default: 0},
	absentPeriodLog: [{
		from: {type: String, default: null},
		to: {type: String , default: null},
		_id: false
	}]
});

module.exports = mongoose.model('AbsentLog' , AbsentLogSchema ); 