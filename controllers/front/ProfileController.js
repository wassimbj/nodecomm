const mongoose = require('mongoose');
const User = require('../../database/models/User');
const Order = require('../../database/models/Order');
const Wishlist = require('../../database/models/Wishlist');
const Controller = require('../Controller')
const bcrypt = require('bcrypt');

class Profile extends Controller{

    constructor()
    {
        super();
    }

    // render profile view
    async index(req, res){
        let user_id = mongoose.Types.ObjectId(req.session.userid)
        await User.findById(user_id, {password: false}, (err, user) => {
            // get wishlist and then get orders
            Wishlist.aggregate([
                {$match: {author: user_id}},
                {
                    $lookup: {
                        from: 'products',
                        let: {p_id: '$product'},
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$p_id'] } } },
                            {
                                $lookup: {
                                    from: 'discounts',
                                    let: {p_discount_id: '$discount'},
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$p_discount_id'] } } },
                                    ],
                                    as: 'discount'
                                }
                            },
                            {
                                $lookup: {
                                    from: 'productimages',
                                    let: { p_id: '$_id' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$img_to', '$$p_id'] } } },
                                    ],
                                    as: 'images'
                                }
                            }
                        ],
                        as: 'product'
                    }
                }
            ])
            .exec((err, wishlist) => {
                Order.aggregate([
                    { $match: { customer: user_id } },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'customer',
                            foreignField: '_id',
                            as: 'customer'
                        }
                    },
                    {
                        $lookup: {
                            from: 'shippings',
                            localField: 'ship_to',
                            foreignField: '_id',
                            as: 'ship'
                        }
                    },
                    {
                        $lookup: {
                            "from": "carts",
                            "let": { "ords": "$orders" },
                            "pipeline": [
                                { "$match": { "$expr": { "$in": ["$_id", "$$ords"] } } },
                                {
                                    "$lookup": {
                                        "from": 'products',
                                        "let": { "p_id": "$product" },
                                        "pipeline": [
                                            { "$match": { "$expr": { "$eq": ["$_id", "$$p_id"] } } },
                                            {
                                                $lookup: {
                                                    from: 'productimages',
                                                    let: {'product_id': '$_id'},
                                                    pipeline: [
                                                        {$match: {$expr: {$eq: ['$img_to', '$$product_id']} }}
                                                    ],
                                                    as: 'images'
                                                }
                                            }
                                        ],
                                        as: "product"
                                    }
                                }
                            ],
                            "as": "ords"
                        }
                    }
                ]).exec((err, orders) => {
                    // console.log(wishlist[0].product)
                    res.render('front.profile', {
                        user,
                        wishlist,
                        orders
                    });
                });
            })
        });
        // res.render('front.profile');
    }

    // render edit profile view
    edit(req, res)
    {
        // let user_id = mongoose.Types
        let msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        User.findById(req.session.userid, (err, user) => {
            if(err)
                console.log(err);
            else
                res.render('front.edit_profile', {user, msg, msgType}) 
        });
    }

    // update user info
    // method: POST
   async update(req, res)
    {
        // get authenticated user
        await User.findById(req.session.userid, (err, user) => {
            // get user image
            let new_img = req.file,
                { new_email, new_firstname, new_lastname, current_pass, new_pass} = req.body,
                data = {};
            var errors = [];
            if(new_img !== undefined)
                data['image'] = new_img.secure_url;

            // Verify password
            const pro1 = new Promise((resolve, reject) => {
                // console.log('Pro1');
                if (current_pass)
                {
                    bcrypt.compare(current_pass, user.password, (err, same) => {
                        if(!same)
                        {
                            errors.push('Your current password is wrong');
                            reject(errors);
                        }else{
                            if(!new_pass){
                                errors.push('Please enter your new password');
                                reject(errors);
                            }else
                            {
                                bcrypt.hash(new_pass, 10, (err, hashed) => {
                                    data['password'] = hashed;
                                    resolve(data)
                                    // console.log('new_password: ', errors, data)
                                });
                            }
                        }
                        // console.log('current_password: ', errors, data)
                    })
                }else{
                    resolve('Current pass is empty')
                }
            });

            // verify first name and last
            const pro2 = new Promise((resolve, reject) => {
                // console.log('Pro2');
                if (!new_firstname || !new_lastname)
                {
                    errors.push('Firstname and Lastname are required !');
                    reject(errors);
                }
                else {
                    data['firstname'] = new_firstname;
                    data['lastname'] = new_lastname;
                    resolve(data)
                }
            })
            
            // verify email
            const pro3 = new Promise((resolve, reject) => {
                // console.log('Pro3');
                if (!user.verified) {
                    if (!new_email) {
                        errors.push('Please enter your email')
                        reject(errors)
                    } else {
                        super.valid_email(new_email, (isValid) => {
                            if (!isValid)
                            {
                                errors.push('Please enter a valid email');
                                reject(errors)
                            }
                            else
                            {
                                data['email'] = new_email;
                                resolve(data);
                            }
                            // console.log('new_email: ', errors, data)
                        })
                    }
                }
                // else{
                //     resolve('User is verified')
                // }
            })
            
            // console.log(errors, '<----->', data);
            Promise.all([pro1, pro2, pro3])
                .then(data => {
                    let new_user_details = data[data.length - 1];
                    User.findOneAndUpdate({ _id: req.session.userid }, new_user_details).exec()
                    req.flash('msgType', 'success');
                    req.flash('success', 'Your profile was updated !')
                })
                .catch(err => {
                    console.log(err)
                    req.flash('msgType', 'danger');
                    req.flash('danger', err);
                })
                .finally(() => {
                    return res.redirect('/user/profile/edit')
                })
        })
    }

}

module.exports = new Profile();