const Ship = require('../../database/models/Shipping');
// const Order = require('../../database/models/Order');
const UserModel = require('../../database/models/User');
const Controller = require('../Controller');

class Shipping extends Controller{
    constructor() {
        super();
    }

    // Shipping view
    index(req, res) {
        super.cart_is_empty(req.session.userid, function(empty){
            if (!empty)
            {
                var msgType = req.flash('msgType'),
                    msg = req.flash(msgType),
                    data = req.flash('data');

                Ship.findOne({ user: req.session.userid, used: 0 }).exec((err, ship) => {
                    if (!err) {
                        UserModel.findOne({ _id: req.session.userid }, { password: false }, (error, user) => {
                            if (error || !user)
                            {
                                req.flash('warning', 'Please login to continue the process');
                                req.flash('msgType', 'warning')
                                return res.redirect('/user/cart')
                            } else
                                return res.render('front.shipping', {
                                    ship,
                                    data: data[0],
                                    user,
                                    msg, msgType
                                })
                        })
                    } else
                        return null;
                });

            } else {
                req.flash('warning', "Your cart is empty, you can't procceed to next steps");
                req.flash('msgType', 'warning')
                return res.redirect('/user/cart')
            }
        });
    }

    // store the shipping address
    store(req, res)
    {
        Ship.findOne({ user: req.session.userid, used: 0 }).populate('user').exec((err, ship) => {
            if (!err && ship) { 
                // --------- Update ----------
                Ship.findByIdAndUpdate(ship._id, {
                    ...req.body
                }, { runValidators: true }, (error, resp) => {
                    if (!error && resp) {
                        req.flash('success', 'Your shipping is updated !');
                        req.flash('msgType', 'success');
                    } else {
                        const errors = Object.keys(error.errors).map(key => error.errors[key].message);
                        req.flash('danger', errors);
                        req.flash('msgType', 'danger');
                    }
                    return res.redirect('back');
                });
            } else {
                // --------- Create --------
                Ship.create({
                    ...req.body,
                    user: req.session.userid
                }, (err, resp) => {
                    if (!err && resp) {
                        req.flash('success', 'Your shipping is created !');
                        req.flash('msgType', 'success');
                        return res.redirect('/user/checkout'); 
                    } else {
                        const errors = Object.keys(err.errors).map(key => err.errors[key].message);
                        req.flash('danger', errors);
                        req.flash('msgType', 'danger');
                        req.flash('data', resp)
                        return res.redirect('back');
                    }
                });
            }
        });
    }

}

module.exports = new Shipping();