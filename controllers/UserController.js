const UserModel = require('../database/models/User');
const bcrypt = require('bcrypt');

class User {
    register(req, res) {
        const msg = req.flash('success')[0] || req.flash('errors'),
             msgType = req.flash('msgType');
        return res.render('front.register', {
            msgType: msgType,
            msg: msg,
            data: req.flash('data')[0]
        });
    }

    login(req, res) {
        const msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        return res.render('front.login', {
            msgType, msg,
            data: req.flash('data')[0]
        });
    }

    logout(req, res)
    {
        req.session.destroy((err) => {
            return res.redirect('/shop');
        });
    }

    // Register user
    async store(req, res){
      await UserModel.create({
          ...req.body,
          image: 'https://www.laroutedesvoyages.com/images/user-default.png'
      }, (err, result) => {
              if (!err) {
                  req.flash('success', `Welcome ${result.firstname} ! your account was successfully created`);
                  req.flash('msgType', 'success');
                  req.session.userid = result.id;
                  return res.redirect('/shop');
              } else {
                  const error = Object.keys(err.errors).map(key => err.errors[key].message);
                  req.flash('danger', error)
                  req.flash('msgType', 'danger');
                  req.flash('data', req.body);
                  res.redirect('/register');
              }
      });
    }

    // Login user
    async loginUser(req, res){
        // Get the user by email
       await UserModel.findOne({email: req.body.email}, (err, user) => {
           // Check if there is user
          if(!err && user)
          {
           // compare passwords
              bcrypt.compare(req.body.password, user.password, (err, same) => {
                if(same)
                {
                    req.session.userid = user.id;
                    res.redirect('/shop');
                }else{
                    req.flash('danger', 'Oops ! Wrong password');
                    req.flash('msgType', 'danger');
                    return req.redirect('/login');
                }
              });
          }else{
            req.flash('danger', 'Oops ! no user was found');
            req.flash('msgType', 'danger');
            return res.redirect('/login');
          }
       });

    }

    // Auth function
    auth(req, res, next){
        UserModel.findOne({_id: req.session.userid}, (err, user) => {
            if(err || !user)
                return res.redirect('/login')
              next();
            });
    }

    redirectIfAuth(req, res, next){
        if(req.session.userid)
            return res.redirect('/');
        
        next();
    }
}

module.exports = new User();