
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , nodemailer = require('nodemailer')
  , json = require('jsonify');

var app = express()
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;
  
  
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "mike.hemesath@gmail.com",
        pass: "ovqqjhitipyiwyjh"
    }
});

routes = routes(app);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.compress());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser('red velvet'));
  app.use(express.cookieSession());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'Something broke!');
  });
});

app.configure('development', function(){
  app.use(express.errorHandler());
  mongoose.connect('mongodb://localhost/wedding');
  app.locals({
    siteURL: 'http://localhost:3000'
  });
});

app.configure('production', function() {
  mongoose.connect('mongodb://nodejitsu:68a867653192c05aab1d8752a4e1ecef@dharma.mongohq.com:10097/nodejitsudb2830578889');
  app.locals({
    siteURL: 'http://www.mikestaceykc.com'
  });
});


var Guest = mongoose.model('Guest', new Schema({
    first_name  : { type: String, default: '', validate: [nonEmpty, 'Guest first name is required.'] }
  , last_name   : { type: String, default: '', validate: [nonEmpty, 'Guest last name is required.'] }
  , dinner      : { type: String, default: 'Chicken', validate: [requiredIfAttending, 'Please provide a dinner option.'] }
  , adult       : Boolean
}));


function requiredIfAttending(val) {
  if (this.parent.attending) {
    return true;
  } else {
    return val && val.length > 0;
  }
}

function nonEmpty(val) {
  return (val || '').replace(/ /g,'').length > 0;
}

mongoose.model('RSVP', new Schema({
    email       : { type: String, unique: true, required: true, default: '', validate: [nonEmpty, 'Please provide your email address'] }
  , guests      : [Guest.schema]
  , date        : { type: Date, default: function() { return new Date(); } }
  , attending   : Boolean
}));


app.get('/', routes.index);
app.get('/rsvp', routes.rsvp.index);
app.post('/rsvp', routes.rsvp.create);
app.get('/rsvp/:id', routes.rsvp.loadRSVP, routes.rsvp.show);
app.post('/rsvp/:id',  routes.rsvp.loadRSVP, routes.rsvp.update);


app.get('/guests', routes.guests);
app.post('/guests', routes.guests);


function emailBackup() {
  mongoose.model('RSVP').find({}).lean().exec(function (err, rsvps) {
    var mailOptions = {
      from: "mikestaceykc.com <mike.hemesath@gmail.com>",
      to: 'mike.hemesath@gmail.com',
      subject: "Guest List Backup",
      text: 'Attached is the updated guest list',
      attachments: [
        {   // utf-8 string as an attachment
          fileName: "rsvps.json",
          contents: json.stringify(rsvps)
        }
      ]
    };
      
    smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
        console.log(error);
    	  return;
      }
	  
      console.log("Message sent: " + response.message);
    });
  });
}

setInterval(emailBackup, 1000 * 3600 * 24);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
