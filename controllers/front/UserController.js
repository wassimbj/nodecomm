const UserModel = require('../../database/models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const Controller = require('../Controller');

class User extends Controller{

    constructor()
    {
        super();
    }

    // render resgiter view
    register(req, res) {
        var msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        return res.render('front.register', {
            msgType, msg,
            data: req.flash('data')[0]
        });
    }

    // render login view
    login(req, res) {
        var msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        return res.render('front.login', {
            msgType, msg,
            data: req.flash('data')[0]
        });
    }

    // Logout user
    logout(req, res)
    {
        req.session.destroy((err) => {
            return res.redirect('/shop');
        });
    }

    // Register user
    async store(req, res)
    {
      await UserModel.create({
          ...req.body,
          image: 'https://www.laroutedesvoyages.com/images/user-default.png'
      }, (err, result) => {
              if (!err) {
                  let content = `
                    <div style='max-width:600px;margin:0 auto;font-size:16px;line-height:24px'>
                        <div style='text-center; display: block'> <h3> NodeComm </h3> </div>
                        Hey ${result.firstname} ! <br>
                        <p> Please verify your email so you can start making great deals and get our latest ! </p>
                        <p> <img src='https://www.datavalidation.com/assets/images/15469571.validation-icon.png'> </p>
                        <br>
                        <a href='http://localhost:3000/auth/verify/${result.verify_token}'
                            style='background-color: #17b978;
                                    color: white;
                                    padding: 1em 2rem;
                                    display: block;
                                    font-weight: bold;
                                    text-decoration: none;
                                    text-align: center;'
                        >
                            Verify email
                        </a>
                        <hr>
                        <b> OR </b>
                        <p> You can copy and paste this link in your browser if the link button doesn't work </p>
                        <p> http://localhost:3000/auth/verify/${result.verify_token} </p>
                    </div>
                  `;

                  super.sendmail(result.email, 'Email verification ! from Nodecomm', content, (resp) => {
                    if(resp)
                    {
                        // req.flash('success', `Welcome ${result.firstname} ! your account was successfully created`);
                        // req.flash('msgType', 'success');
                        req.session.userid = result.id;
                        return res.redirect('/shop');
                    }
                  });
              } else {
                  const error = Object.keys(err.errors).map(key => err.errors[key].message);
                  req.flash('danger', error)
                  req.flash('msgType', 'danger');
                  req.flash('data', req.body);
                  res.redirect('/auth/register');
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
                    return res.redirect('/auth/login');
                }
              });
          }else{
            req.flash('danger', 'Oops ! no user was found');
            req.flash('msgType', 'danger');
            return res.redirect('/auth/login');
          }
       });

    }


    // Send email verififcation
    // Method: GET
    async send_verification(req, res)
    {
        await UserModel.findOne({_id: req.session.userid})
                .exec((err, user) => {
                        let content = `
                                <div style='max-width:600px;margin:0 auto;font-size:16px;line-height:24px'>
                                    <div style='text-center; display: block'> <h3> NodeComm </h3> </div>
                                    Hey ${user.firstname} ! <br>
                                    <p> Please verify your email so you can start making great deals and get our latest ! </p>
                                    <p> <img src='https://www.datavalidation.com/assets/images/15469571.validation-icon.png'> </p>
                                    <br>
                                    <a href='http://localhost:3000/auth/verify/${user.verify_token}'
                                        style='background-color: #17b978;
                                                color: white;
                                                padding: 1em 2rem;
                                                display: block;
                                                font-weight: bold;
                                                text-decoration: none;
                                                text-align: center;'
                                    >
                                        Verify email
                                    </a>
                                    <hr>
                                    <b> OR </b>
                                    <p> You can copy and paste this link in your browser if the link button doesn't work </p>
                                    <p> http://localhost:3000/auth/verify/${user.verify_token} </p>
                                </div>
                            `;

                        super.sendmail(user.email, 'Email verification ! from Nodecomm', content, (resp) => {
                            console.log(resp)
                            if (resp) {
                                req.flash('msgType', 'success');
                                req.flash('success', 'Please check your inbox ! we have sent you the verification email')
                                return res.redirect('/user/profile');
                            }
                        });
                })
    }

    // Verify user email
    async verify_email(req, res)
    {
        // get user by token
        await UserModel.findOne({
            verify_token: req.params.token
        }, {password: false}, (err, user) => {
            // console.log('findOne: ', err, user)
            let confirmed = true;
            if(!err && user)
            {
                confirmed = true;
                let generated_token = crypto.randomBytes(12),
                    new_verify_token = generated_token.toString('hex');
                UserModel.findOneAndUpdate({ _id: user._id }, {
                        verified: true,
                        verify_token: new_verify_token
                }).exec();
            }else{
                confirmed = false;
                console.log(err)
            }
            return res.render('front.verify_email', { confirmed })
        })
    }

    // Auth function
    auth(req, res, next){
        UserModel.findOne({_id: req.session.userid}, (err, user) => {
            if(err || !user)
                return res.redirect('/auth/login')
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