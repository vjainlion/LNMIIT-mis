//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const app = express();
const alert = require('alert-node');
temp1 = '';
temp2 = '';

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret:"hello",
  resave: false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/misDB",{useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
mongoose.set('useCreateIndex', true);
const userSchema = new mongoose.Schema({
  first:String,
  last:String,
  username:String,
  password:String,
    father:String,
    mother:String,
    scellno:String,
    fcellno:String,
    mcellno:String
});



userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User",userSchema);



passport.use(User.createStrategy());


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static("public"));


app.get("/",function(req,res){

 const t = global.temp1;
 global.temp1 = '';
  res.render("signin",{success:t});
});

// app.post('/', function(req, res, next) {
//
//   const user = new User({
//     username:req.body.username,
//     password:req.body.password
//   });
//   passport.authenticate('local', function(err, user, info) {
//     if (err) { return next(err); }
//     if (!user) { return res.redirect('/'); }
//     req.logIn(user, function(err) {
//       if (err) { return next(err); }
//       return res.redirect('/main');
//     });
//   })(req, res, next);
// });
app.post("/",function(req,res){

const user = new User({

   username:req.body.username,
   password:req.body.password
});

req.login(user, function(err) {
  if (err) {

    console.log(err);
   }
  else{

  passport.authenticate("local")(req,res,function(){
    res.redirect("/main");

  });


}
});


});

app.get("/logout",function(req,res){
req.logout();  // deauthenticate
res.redirect("/");

});
app.get("/studentdetail",function(req,res){

    if(req.isAuthenticated()){
        var actual = req.user.username;
        var text = "";
        var i  = 0;
        while(actual[i]!='@')
        {
            text = text + actual[i];
            i++;
        }
        res.render("studentdetail",{name:text,firstname:req.user.first,email:actual,fathername:req.user.father,mothername:req.user.mother,studentmobileno:req.user.scellno,fathermobileno:req.user.fcellno,mothermobileno:req.user.mcellno});
     }
});
app.get("/performance",function(req,res){

    if(req.isAuthenticated())
    {
        var name = req.user.first;
        res.render("partials/performance");
    }

});
app.get("/main",function(req,res){
if(req.isAuthenticated()){
  const t2 = global.temp2;
  global.temp2 = '';
  res.render("main",{success:t2});
}
else{
  res.redirect("/");
}

});
app.get("/register",function(req,res){

  res.render("signup");
});
app.post("/register",function(req,res){

 User.findOne({username:req.body.username},function(err,findUser){
   if(findUser)
   {
     // res.render("signin",{success:'Already registered, please login to continue'});
     global.temp1 = 'Already registered, please login to continue';
    res.redirect("/");
   }
   else
   {
     User.register({first:req.body.firstname,last:req.body.lastname,username:req.body.username,father:"",mother:"",fcellno:"",mcellno:"",scellno:""}, req.body.password,function(err, user) {
       if (err) {
        console.log(err);
        res.redirect("/register");
        }
        else{
       passport.authenticate("local")(req,res,function(){
         global.temp2 = 'Successfully registered';
         res.redirect("/main");
       })
        }

       });
   }

 });

  });


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
