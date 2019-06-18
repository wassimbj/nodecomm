// const path = require('path');
const Cart = require('../database/models/Cart');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Order = require('../database/models/Order')

class Controller {
    constructor() {
        // Constructor
    }
    
    cart_is_empty(user_id, cb)
    {
        Cart.find({author: user_id, paid: 0}, (err, cart) => {
            if(!err && cart.length > 0)
               cb(false);
            else
                cb(true)
        })
    }

    // Get order details: cart_ids, total amount...
   async order_details(user_id, cb)
    {
        var order_ids = [],
            total = 0;
       await Cart.find({author: user_id, paid: 0}, (err, cart) => {
           cart.map(item => {
               order_ids.push(mongoose.Types.ObjectId(item.id));
               total = total + item.total;
           });
        });
       cb(order_ids, total)

    }

    // Send emails
    async sendmail(to_who, subject, content, cb)
    {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = 'contactwassim016@gmail.com';
        let from = '"nodeComm" <nodeComm@support.com>',
            to = Array.isArray(to_who) ? to_who.split(',') : to_who;

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'contactwassim016', // generated ethereal user
                pass: 'contactwassim00' // generated ethereal password
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: from,     // sender address
            to: to,          // list of receivers
            subject: subject, // Subject line
            // text: text,     // text content
            html: content       // content
        });

        cb(info);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    }

    // get signle order by id
    async get_single_order(id, cb)
    {
        await Order.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(id) } },
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
                                ],
                                as: "product"
                            }
                        }
                    ],
                    "as": "ords"
                }
            }
        ]).exec((err, order) => {
            cb(order)
        });
    }

    // get orders
    async get_orders(cb){
        await Order.aggregate([
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
                                ],
                                as: "product"
                            }
                        }
                    ],
                    "as": "ords"
                }
            }
        ]).exec((err, order) => {
            cb(order)
        });
    }


    // Valid email function
    valid_email(email, cb) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        cb(re.test(email));
    }

}

module.exports = Controller;