const mongoose = require('mongoose')
const OrderModel = require('../../database/models/Order');
var fs = require('fs');
const pdf = require('html-pdf')

class Order {

    constructor()
    {
        this.order_details = [];
    }

    // See All orders
    index(req, res) {
        OrderModel.aggregate([
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
                    from: 'carts',
                    localField: 'orders',
                    foreignField: '_id',
                    as: 'ordersObject'
                }
            }
        ]).exec((err, orders) => {
            res.render('back.orders', { orders });
        });
    }
    
    // Single detailed order
    details(req, res)
    {
        const id = req.params.id;
        OrderModel.aggregate([
            {$match: {_id: mongoose.Types.ObjectId(id)}},
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
                "$lookup": {
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
            // console.log(order[0])
            this.order_details = order[0];
            res.render('back.order_details', { order: order[0]})
        });

    }

    // Change the order status
    changeStatus(req, res)
    {
        const id = mongoose.Types.ObjectId(req.body.id);
        OrderModel.findOneAndUpdate({ _id: id }, { delivered: req.body.status }, (err, data) => {
            if (err)
                res.json(err)
            else
                res.json(data)
        });
    }

    // Print invoice ( Not finished yet !!)
    printInvoice(req, res)
    {
        // res.json('PDF')
        // var html = fs.readFileSync('../../templates/test.html', 'utf8');
        // var options = { format: 'Letter' };

        // pdf.create(html, options).toFile('../../templates/test.pdf', function (err, res) {
        //     if (err) return console.log(err);
        //     console.log(res); // { filename: '/app/businesscard.pdf' }
        // });
    }

    // Send invoice par email ( Not finished yet !! )
    sendInvoice(req, res)
    {
        // with Nodemailer module
    }

}

module.exports = new Order();