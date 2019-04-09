const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const traineeRoutes = express.Router();
const nodeMailer = require('nodemailer');
const PORT = 4000;
const bcrypt = require('bcrypt');


var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var User = require('./models/staff.js');
var CryptoJS = require("crypto-js");
var options = { mode: CryptoJS.mode.ECB, padding:  CryptoJS.pad.Pkcs7};
//var key = CryptoJS.enc.Hex.parse('bW5Ks7SIJu');

let Trainee = require('./trainee.model');

app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
  }));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

traineeRoutes.route('/register').post(function(req,res){
  CryptoJS.pad.NoPadding = {pad: function(){}, unpad: function(){}};
  var key = CryptoJS.enc.Hex.parse("253D3FB468A0E24677C28A624BE0F939");
  var iv  = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");

  var encrypted = CryptoJS.AES.encrypt(req.body.email, key, {iv: iv, padding: CryptoJS.pad.NoPadding});
        //var encryptedemail = CryptoJS.AES.encrypt(encrypted, 'bW5Ks7SIJu');
        var newUser = new User({
          email: encrypted.toString(),
          password: req.body.password,
          role: req.body.role
        });

        User.createUser(newUser, function(err, user){
          if(err) throw err;
          res.send(user).end()
        });
});

// Endpoint to login
traineeRoutes.route('/login').post(passport.authenticate('local'),
  function(req, res) {
    res.send({result: true, email: req.user.email});
  }
);

// Endpoint to get current user
traineeRoutes.route('/user').get(function(req, res){
  res.send(req.user);
})

// Endpoint to logout
traineeRoutes.route('logout').get(function(req, res){
  req.logout();
  res.send(null)
});

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  function(email, password, done) {
    console.log(email);
    console.log(password);
    var bytes  = CryptoJS.AES.decrypt(password, 'c9nMaacr2Y');
    var decryptPass = bytes.toString(CryptoJS.enc.Utf8);

    User.getUserByEmail(email, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unknown User'});
      }
      User.comparePassword(decryptPass, user.password, function(err, isMatch){
        if(err) throw err;
     	if(isMatch){
     	  return done(null, user);
     	} else {
     	  return done(null, false, {message: 'Invalid password'});
     	}
     });
   });
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

mongoose.connect('mongodb://localhost:27017/trainees', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

traineeRoutes.route('/').get(function(req, res) {
    Trainee.find(function(err, trainee) {
        if (err) {
            console.log(err);
        } else {
            res.json(trainee);
        }
    });
});

traineeRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Trainee.findById(id, function(err, trainee) {
        if(trainee.trainee_account_no != null && trainee.trainee_sort_code != null){
         var accountBytes  = CryptoJS.AES.decrypt(trainee.trainee_account_no, 'c9nMaacr2Y');
         var plaintext = accountBytes.toString(CryptoJS.enc.Utf8);
         trainee.trainee_account_no = plaintext;
         var sortBytes  = CryptoJS.AES.decrypt(trainee.trainee_sort_code, 'c9nMaacr2Y');
         var sortPlainText = sortBytes.toString(CryptoJS.enc.Utf8);
         trainee.trainee_sort_code = sortPlainText;
        }
         
         ///////////////////////////////////////////////////
         //var emailBytes = CryptoJS.AES.decrypt(trainee.trainee_email, key, options);
         //var emailPlainText = emailBytes.toString(CryptoJS.enc.Utf8);
         //console.log(emailPlainText);
         res.json(trainee);
    });
});


traineeRoutes.route('/update/:id').post(function(req, res) {
    Trainee.findById(req.params.id, function(err, trainee) {
        if (!trainee)
            res.status(404).send("data is not found");
        else
            
            var encryptedAccountNo = CryptoJS.AES.encrypt(req.body.trainee_account_no, 'c9nMaacr2Y');
            var encryptedAccNum = encryptedAccountNo.toString();
            var encryptedSortNo = CryptoJS.AES.encrypt(req.body.trainee_sort_code, 'c9nMaacr2Y');
            var encryptedSortNum = encryptedSortNo.toString();
            trainee.trainee_fname = req.body.trainee_fname;
            trainee.trainee_lname = req.body.trainee_lname;
            trainee.trainee_email = req.body.trainee_email;
            //trainee.trainee_email = CryptoJS.AES.encrypt(req.body.trainee_email, key, options).toString();
            trainee.trainee_account_no = encryptedAccNum;
            trainee.trainee_sort_code = encryptedSortNum;

            trainee.save().then(trainee => {
                res.json('Trainee updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

traineeRoutes.route('/update-password/:id').post(function(req, res) {
    Trainee.findById(req.params.id, function(err, trainee) {
        if (!trainee)
            res.status(404).send("data is not found");
        else
            //bcrypt pass
            var bytes  = CryptoJS.AES.decrypt(req.body.trainee_password, 'traineePassword');
            var decryptPass = bytes.toString(CryptoJS.enc.Utf8);
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(decryptPass, salt, function(err, hash) {
                  req.body.trainee_password = hash;
                  trainee.trainee_password = req.body.trainee_password;
                  trainee.save().then(trainee => {
                    res.json('Password updated!');
                })
                .catch(err => {
                    res.status(400).send("Update not possible");
                });
                });
              });
    });
});


traineeRoutes.route('/add').post(function(req, res) {
    let trainee = new Trainee(req.body);
    //var encryptedemail = CryptoJS.AES.encrypt(req.body.email, key, options);
    //trainee.trainee_email = encryptedemail.toString(); 
    trainee.save()
        .then(trainee => {
            res.status(200).json({'trainee': 'Trainee added successfully'});
        })
        .catch(err => {
            res.status(400).send('Adding new trainee failed');
        });
});

//traineeRoutes.route('/send-email').post(function(req, res) {
//      let transporter = nodeMailer.createTransport({
//          service: 'AOL',
//          auth: {
//              user: 'QABursary@aol.com',
//              pass: 'Passw0rd123'
//          }
//      });
//      let mailOptions = {
//          from: 'QABursary@aol.com', // sender address
//          to: req.body.trainee_email, // list of receivers
//          subject: 'test', // Subject line
//          text: 'test', // plain text body
//      };
//
//      transporter.sendMail(mailOptions, (error, info) => {
//          if (error) {
//              return console.log(error);
//          }
//          console.log('Message %s sent: %s', info.messageId, info.response);
//          res.status(200).json({'email': 'Email Sent'});
//      });
//});

traineeRoutes.route('/send-email').post(function(req, res) {
    var email = CryptoJS.AES.decrypt(req.body.trainee_email, '3FJSei8zPx');
    Trainee.findOne({trainee_email: req.body.trainee_email}, function(err, trainee) {
        console.log(req.body.trainee_email)
        console.log(trainee)
        if (!trainee){
            res.status(404).send("Email is not found");
        }
        else{
            var transporter = nodeMailer.createTransport({
                service: 'AOL',
                auth: {
                    user: 'QABursary@aol.com',
                    pass: 'Passw0rd123'
                }
            });
            var mailOptions = {
                from: 'QABursary@aol.com', // sender address
                to: email.toString(CryptoJS.enc.Utf8), // list of receivers
                subject: 'Password Reset', // Subject line
                text: 'http://localhost:3000/changePassword/'+ trainee._id, // plain text body
            }            

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
                res.status(200).json({'email': 'Email Sent'});
            });
        }
    });
});

app.use('/trainee', traineeRoutes);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});