const Ship = require('../database/models/Shipping');
const Cart = require('../database/models/Cart');
const User = require('../database/models/User');

// cb = Call Back

class Controller {
    constructor() {
        // Constructor
    }
    
    cart_is_empty(user_id, cb)
    {
        Cart.find({author: user_id}, (err, cart) => {
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
            total = 0,
            ship_to;

       await Cart.find({author: user_id}, (err, cart) => {
           cart.map(item => {
               order_ids.push(item.id);
               total = total + item.total;
           });
        }, (error, cart) => {
            Ship.findOne({ user: req.session.userid, used: 0 }).exec((err, ship) => {
                ship_to = ship.id
            })
        });
       
       cb(order_ids, total, ship_to)

    }
}

module.exports = Controller;