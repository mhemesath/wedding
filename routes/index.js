var mongoose = require('mongoose');

/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Michael & Stacey - 10/5/2013' });
};


exports.rsvp = {
  
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
      , guests = req.param('guests')
      , id = req.param('id');
    

    if (req.param('save')) {
      rsvp.guests = guests;
      RSVP.update({_id: id, }, rsvp, function(err) {
        if (err) {
          console.log(err);
          res.render('rsvp/show', {
             title: 'Michael &amp; Stacey - Mange Reservation',
             rsvp: rsvp
          });
          return;
        }
        res.redirect('/');
      });
      return;
    }
    
    rsvp._id = id
    rsvp = new RSVP(rsvp);
    
    // Add a new guest
    if (req.param('add_guest')) guests.push({});
    
    for (var i=0; i<guests.length; i++) {
      rsvp.guests.push(new Guest(guests[i]));
    }
    
    
    if (req.param('remove_guest')) {
      var index = parseInt(req.param('remove_guest'), 10);
      rsvp.guests[index].remove();
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
    var RSVP = mongoose.model('RSVP');
    console.log(req.param('id'))
    RSVP.findById(req.param('id'), function (err, rsvp) {
      if (err) console.log(err);
      
      res.render('rsvp/show', {
         title: 'Michael &amp; Stacey - Mange Reservation',
         rsvp: rsvp
      });
    });
    
  }
}
/*

exports.rsvp_new = function(req, res) {
  var RSVP = mongoose.model('RSVP')
    , Guest = mongoose.model('Guest');
  
  res.render('rsvp', { 
    title: 'Michael &amp; Stacey - RSVP', 
    rsvp: new RSVP({ attending: req.param('attending') === 'true' }),
    guest: new Guest({})
  });
};


exports.rsvp_create = function(req, res) {
  var RSVP = mongoose.model('RSVP')
    , Guest = mongoose.model('Guest')
    , guestCount = req.param('guest_count');
  
  var rsvp = new RSVP(req.param('rsvp')),
      guests = req.param('guests') || [];
  
  
};

*/