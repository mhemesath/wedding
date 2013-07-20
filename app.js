
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose');

var app = express()
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

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
});

app.configure('production', function() {
  mongoose.connect('mongodb://nodejitsu:68a867653192c05aab1d8752a4e1ecef@dharma.mongohq.com:10097/nodejitsudb2830578889');
});


var Guest = mongoose.model('Guest', new Schema({
    first_name  : { type: String, required: true, default: '' }
  , last_name   : { type: String, required: true, default: '' }
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

function notEmpty(val) {
  return val && val.length > 0;
}

mongoose.model('RSVP', new Schema({
    email       : { type: String, unique: true, required: true, default: '', validate: [notEmpty, 'Please provide your email address'] }
  , guests      : [Guest.schema]
  , date        : { type: Date, default: function() { return new Date(); } }
  , attending   : Boolean
}));


app.get('/', routes.index);
app.get('/rsvp', routes.rsvp.index);
app.post('/rsvp', routes.rsvp.create);
app.get('/rsvp/:id', routes.rsvp.show);
app.post('/rsvp/:id', routes.rsvp.update);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
