const Ship = require('../../database/models/Shipping');
const Cart = require('../../database/models/Cart');
const User = require('../../database/models/User');
const mongoose = require('mongoose')
// cb = Call Back

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
}

module.exports = Controller;