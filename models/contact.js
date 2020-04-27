var mongoose = require("mongoose");
var commentSchema = mongoose.Schema({
	
	
	subject:String,
	text :String
	
	
});
module.exports = mongoose.model("Contact",commentSchema);