const mongoose = require('mongoose');
const User = require('../../database/models/User');
const Order = require('../../database/models/Order');
const Wishlist = require('../../database/models/Wishlist');
const Controller = require('../Controller')


class Profile extends Controller{

    constructor()
    {
        super();
    }

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

}

module.exports = new Profile();