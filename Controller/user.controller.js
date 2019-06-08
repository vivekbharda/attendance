var userModel = require('../models/user.model');
var userController = {};

userController.signUp = function(req,res){
	console.log("it works ======>" , req.body);
	userModel.findOne({email : req.body.email} , (err , foundUser)=>{
		console.log("found USer =======+>" , foundUser)
		if(err){
			res.status(400).send(err);
		}
		else if(foundUser){
			res.status(500).send("Email already exists");
		}
		else{
			var newUser = new userModel(req.body);
			newUser.save((err , userSaved)=>{
				if(err){
					res.status(400).send(err);
				}
				else{
					console.log("userSaved =========> " , userSaved);
					res.status(200).send(userSaved);
				}
			});		
		}
	});
	
}
userController.login = function(req,res){
	console.log("Req. body of login ===========>" , req.body.email , "=======++> " , req.body.password);
	userModel.findOne({email: req.body.email , password: req.body.password} , (err,foundUser)=>{
		if(err){
			res.status(404).send(err);
		}
		else if(foundUser == null){
			  response =  "Bad request"
			res.status(400).send(response);

		}
		else{
			res.status(200).send(foundUser);
		}
	});
}
userController.getUsers = function(req,res){
	console.log("Req. body of getUSes ===========>" , req.body);

	userModel.find({} , (users,err)=>{
		if(err){
			res.status(400).send(err);
		}
		else{
			res.status(200).send(users);
		}
	})
}

userController.getUserById = function(req,res){
	console.log("Req. body of get user By ID ===========>" , req.body);

	userModel.findOne({_id : req.body.id} , (foundUser , err)=>{
		if(err){
			res.status(404).send(err);
		}
		else{
			if(err){
				response  = { message :  "No User Found"};
					res.status(400).send(response);	
			}
			else{
				res.status(200).send(foundUser)
			}
		}
	});
}

userController.updateUserById = function(req,res){
	console.log("req body of update user by Id" , req.body);

	userModel.findOneAndUpdate({_id: req.body.id} , {$set: req.body} , {upsert: true, new: true} , (updatedUser , err)=>{
		if(err){
			res.status(400).send(err);
		}
		else{
			res.status(200).send(updatedUser);
		}
	});
}	

userController.deleteUserById = function(req,res){
	console.log("Req. body of delete ===========>" , req.body);
	
	userModel.findOneAndRemove({_id : req.body.id} , (removedUser,err)=>{
		if(err){
			res.status(404).send(err);
		}
		else{
			if(removedUser == null){
				response  = { message :  "No User Found"};
				res.status(400).send(response);
			}
			else{
				response  = { message :  "User Deleted Succesfully"};
				res.status(200).send(removedUser);
			}
		}
	});	
}
module.exports = userController;