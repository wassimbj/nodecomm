const Product = require('../../database/models/Product');
const User = require('../../database/models/User');
const Order = require('../../database/models/Order');

class AdminHome {
    
    index(req, res) {
        Product.countDocuments((err, total_products) => {
            User.countDocuments((err, total_users) => {
                Order.countDocuments((err, total_orders) => {
                    User.find({
                        created_at: {
                            $gte: new Date(new Date() - (5 * 60 * 60 * 24 * 1000))
                        }
                    }).exec((err, new_users) => {
                        Order.find({
                            created_at: {
                                $gte: new Date(new Date() - (5 * 60 * 60 * 24 * 1000))
                            }
                        }).populate('customer').exec((err, new_orders) => {
                            res.render('back.dashboard', {
                                total_products,
                                total_users,
                                total_orders,
                                new_users,
                                new_orders
                            });
                        })
                    })
                })
            })
        })
    }

}

module.exports = new AdminHome();