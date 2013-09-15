var mongoose = require('mongoose'),
	nodemailer = require('nodemailer');
	
    
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "mike.hemesath@gmail.com",
        pass: "ovqqjhitipyiwyjh"
    }
});

var routes = {
}

function emailConfirmation(rsvp) {
  var firstName = rsvp.guests[0].first_name;
  app.render('email', { rsvp: rsvp, firstName: firstName }, function(htmlErr, html){
    app.render('email_text', { rsvp: rsvp, pretty: true }, function(textErr, text) {
      var mailOptions = {
        from: "mikestaceykc.com <mike.hemesath@gmail.com>",
        to: rsvp.email,
        subject: "RSVP Confirmation - Mike & Stacey's Wedding",
        text: text,
        html: html 
      };
        
      smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
          console.log(error);
      	  return;
        }
	
        console.log("Message sent: " + response.message);
      });
    
    });
  });
}


routes.index = function(req, res) {
  res.render('index', { title: 'Michael & Stacey - 10/5/2013' });
};


routes.guests = function(req, res) {
  
  if (req.param('password') !== 'thailand') {
    res.render('login', {
      title: 'Login'
    });
    return
  }
  
  mongoose.model('RSVP').find({}, function (err, docs) {
    res.render('guests', {
      title: 'Guest List',
      rsvps: docs
    });
  });
};


routes.rsvp = {
  
  index: function(req, res) {
    var RSVP = mongoose.model('RSVP')
      , query = req.param('query')
      , rsvp = null;
      
    if (query) {
      RSVP.findOne({ 'email': query }, 'email, guests, attending', function (err, rsvp) {
        if (err) return handleError(err);
        if (rsvp) {
          res.redirect('rsvp/' + rsvp._id);
        } else {
          res.render('rsvp/index', { 
            title: 'Michael &amp; Stacey - RSVP', 
            rsvp: null,
            query: query
          });
        }
      });
      return
    } 
    
    res.render('rsvp/index', { 
      title: 'Michael &amp; Stacey - RSVP', 
      rsvp: null,
      query: ''
    });
    
  },
  
  new: function(req, res) {
    
  },
  
  update: function(req, res) {
    
    var RSVP = mongoose.model('RSVP')
      , Guest = mongoose.model('Guest')
      , rsvp = req.param('rsvp')
      , guests = req.param('guests') || []
      , id = req.param('id');
    
    rsvp._id = id
    rsvp = new RSVP(rsvp);
    for (var i=0; i<guests.length; i++) {
      rsvp.guests.push(new Guest(guests[i]));
    }
    
    res.locals.error = false;
    
    // Save Guest List
    if (req.param('save')) {
      
      req.rsvp.attending = rsvp.attending;
      req.rsvp.email = rsvp.email;
      req.rsvp.guests = [];
      
      for (var i=0; i< rsvp.guests.length; i++) {
        req.rsvp.guests.push(rsvp.guests[i]);
      }
      
      req.rsvp.save(function(err) {
        if (err) {
          if (err.errors) {
            res.locals.error = "Please ensure all guest information is filled out."
          } else {
            res.locals.error = "An error occurred. Try again later or email mike.hemesath@gmail.com if the error continues."
            console.log(err);
          }
          
          res.render('rsvp/show', {
             title: 'Michael &amp; Stacey - Mange Reservation',
             rsvp: req.rsvp
          });
          return;
        }
		
		    // Succesfully Update
		    //emailConfirmation(rsvp);
        res.render('rsvp/confirmation', {
			    title: 'Michael &amp; Stacey - RSVP Confirmation',
			    rsvp: req.rsvp
        });
      });
      return;
    }
    
    // Add a new guest
    if (req.param('add_guest')) rsvp.guests.push(new Guest({}));
    
    // Remove Guest
    if (req.param('remove_guest')) {
      rsvp.guests.id(req.param('remove_guest')).remove();
    }
    
    res.render('rsvp/show', {
       title: 'Michael &amp; Stacey - Mange Reservation',
       rsvp: rsvp
    });
    
  },
  
  create: function(req, res) {
    var RSVP = mongoose.model('RSVP')
      , Guest = mongoose.model('Guest')
      , rsvp = req.param('rsvp') || {}
      , guest = req.param('guest') || {};
    
    
    rsvp = new RSVP(rsvp);
    guest = new Guest(guest);
    
    if (req.param('save')) {
      rsvp.guests.push(guest);
      
      return rsvp.save(function(err) {
        if (err) {
          
          // Duplicate email
          if (11000 === err.code || 11001 === err.code) {
            res.locals.error = 'A RSVP has already been registed to that email address.'
          } else if (err.errors) {
            res.locals.error = "Please complete all fields."
          } else {
            res.locals.error = "An error occurred. Try again later or email mike.hemesath@gmail.com if the error continues."
          }
          
          res.render('rsvp/new', { 
            title: 'Michael &amp; Stacey - RSVP', 
            rsvp: rsvp,
            guest: guest
          });
        } else {
          res.redirect('/rsvp/' + rsvp._id)
        }
      });
    } 
    
    res.render('rsvp/new', { 
      title: 'Michael &amp; Stacey - RSVP', 
      rsvp: rsvp,
      guest: guest,
      error: false
    });
    
  },
  
  show: function(req, res) {
    res.render('rsvp/show', {
       title: 'Michael &amp; Stacey - Mange Reservation',
       rsvp: req.rsvp,
       error: false
    });
  },
  
  loadRSVP: function(req, res, next) {
    var RSVP = mongoose.model('RSVP');
    RSVP.findById(req.param('id'), function (err, rsvp) {
      if (err) console.log(err);
      req.rsvp = rsvp;
      next();
    });
  },
}


module.exports = function(express) {
  app = express;
  return routes;
}

