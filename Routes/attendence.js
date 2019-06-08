var express = require('express');

var attendenceController = require('../Controller/attendence.controller');

var router = express.Router();

router.post('/fill-attendence' , attendenceController.fillAttendence);
router.post('/get-attendence-by-date' , attendenceController.getTodaysAttendenceByDate);
router.get('/get-attendence-by-date-and-id' , attendenceController.getTodaysAttendenceByDateAndId);
router.post('/get-attendence-by-time-interval' ,attendenceController.checkAttendenceIntervalVise);
router.get('/get-absent-logs' , attendenceController.getAllAbsentLogRecords);

module.exports = router;
