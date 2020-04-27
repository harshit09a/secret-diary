var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	Contact  = require("./models/contact.js"),
	User = require("./models/user.js"),
	methodoverride =require("method-override"),
	mongoose = require("mongoose"),
	passport    = require("passport"),
	flash = require("connect-flash"),
    LocalStrategy = require("passport-local");

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost/diary");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodoverride("_method"));
app.use(express.static("public"));
app.use(flash());
app.use(require("express-session")({
	secret: "secret",
    resave: false,
    saveUninitialized: false
	
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
    app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");	
		
   next();
	});

//landing page
app.get("/",function(req,res){
	
	res.redirect("/secrat");
	
});

app.get("/secrat",isLoggedIn,function(req,res){
	//Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
	/*Contact.find({},function(err,foundContact){
		if(err)
			{
				console.log("/secrat find");
				
			}
		else
			{
				res.render("secrat",{contact:foundContact});
			}
	})*/
	User.findById(req.user._id).populate("contacts").exec(function(err, foundContact){
		if(err)
			{
				console.log("/secrat find");
				
			}
		else
			{
				res.render("secrat",{contact:foundContact});
			}
	
});
});
//new contact
app.get("/secrat/new",isLoggedIn,function(req,res){
	
	res.render("new");
});

app.post("/secrat",isLoggedIn,function(req,res){
	Contact.create(req.body.contact,function(err,foundContact){
		
		if(err)
			{
				console.log("/secrat post error");
			}
		else{
			User.findById(req.user._id,function(err,foundUser){
				if(err)
					console.log(err);
				else
					{
						foundUser.contacts.push(foundContact);
						foundUser.save();
						req.flash("success","added succesfully");
						res.redirect("/secrat");
					}
			})
			
						
				
			
			
					}
				
		
			
			
			
		
	});
});




app.get("/secrat/:id",function(req,res){
	Contact.findById(req.params.id,function(err,foundContact){
		if(err)
			{
			req.flash("error","diary not found");
			res.redirect("back");
				console.log("show err");
			}
		else{
			res.render("show",{contact:foundContact});
		}
		
	})
})

//edit 
app.get("/secrat/:id/edit",function(req,res){
	Contact.findById(req.params.id,function(err,foundContact){
		if(err)
			{
				console.log("edit err");
			}
		else{
			res.render("edit",{contact:foundContact});
		}
		
	})
});
app.put("/secrat/:id",function(req,res){
	Contact.findByIdAndUpdate(req.params.id,req.body.contact,function(err,foundContact){
		if(err)
			{
				req.flash("err","dairy not found");
				res.redirect("back");
				console.log("edit err");
			}
		else{
			req.flash("success","succesfully edit");
			res.redirect("/secrat/"+req.params.id);
		}
		
	})
});


app.delete("/secrat/:id",function(req,res){
	Contact.findByIdAndDelete(req.params.id,function(err){
		if(err)
			{
				
				console.log("edit err");
				req.flash("error","dairy not found");
				res.redirect("back");
			}
		else{
			req.flash("success","succesfully deleted");
			res.redirect("/secrat");
		}
		
	})
});
//sign up
app.get("/register",function(req,res){
	res.render("register");
})
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
        
          req.flash("error",err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
							

			req.flash("success","succesfully sign up");
           res.redirect("/secrat"); 
        });
    });
});
app.get("/login",function(req,res){
	
	res.render("login");
})
app.post("/login",passport.authenticate("local",{
	
	successRedirect: "/secrat",
        failureRedirect: "/login"
}),function(req,res){
	
	
	
});

app.get("/logout",function(req,res){
	
	req.logout();
	 
	res.redirect("/secrat");
	
});
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
req.flash("success","login to enter");
    res.redirect("/login");
}
app.listen(3000,function(){
	console.log("server stated");
});
