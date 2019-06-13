const CartModel = require('../../database/models/Cart');
const Product = require('../../database/models/Product');
const ProductImage = require('../../database/models/ProductImage');
const mongoose = require('mongoose')

class Cart{

    async index(req, res)
    {
        var msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        CartModel.aggregate([
            { $match: { author: mongoose.Types.ObjectId(req.session.userid), paid: 0}},
            
            {
                "$lookup": {
                    from: "products",
                    let: { "p_id": "$product" },
                    pipeline: [
                        { "$match": { $expr: { $eq: ["$_id", "$$p_id"] } } },
                        {
                            "$lookup": {
                                from: 'productimages',
                                let: { "p_id": "$_id" },
                                pipeline: [
                                    { "$match": { $expr: { $eq: ["$img_to", "$$p_id"] } } },
                                ],
                                as: "images"
                            }
                        }
                    ],
                    as: "product"
                }
            },

            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: {$sum: '$total'}},
                    count: {$sum: 1},
                    data: {$push: "$$ROOT"}
                }
            },
        ]).exec((err, cart_elems) => {
            // console.log(cart_elems)
            return res.render('front.cart', {
                cart_elems,
                msg, msgType
            })
        })
    }

    // Add to cart
    async addToCart(req, res)
    {
        const { color, size, product, quantity } = req.body;
            await Product.findById(product, (err, item) => {
                // if(inArray(size))
                if (!err && item) {
                    if (!item.colors.includes(color))
                        return res.json({ type: 'error', msg: 'You didnt choose color' });

                    if (item.sizes[0] !== '' && !item.sizes.includes(size))
                        return res.json({ type: 'error', msg: 'You didnt choose size' });

                    if (quantity > item.quantity || quantity == 0)
                        return res.json({ type: 'error', msg: 'The quantity you choosed is not in the stock !' });

                    if (Math.floor(item.quantity / quantity) < 2)
                        return res.json({ type: 'error', msg: "Sorry ! but you can't choose that much quantity !" });
                    // Success !
                    CartModel.findOne({ product: item._id, author: req.session.userid, paid: 0 }, (errs, cart) => {
                        // check if the product is the same in the cart just increase the quantity
                        // else create a new product in the cart
                        if (cart && cart.size == size && cart.color == color) {
                            const updatedQty = parseInt(cart.quantity) + parseInt(quantity);
                            CartModel.findOneAndUpdate({_id: cart._id}, {
                                quantity: updatedQty,
                                total: parseInt(item.price) * updatedQty
                            }, (err, data) => console.log(data));
                        } else {
                            // Insert into the cart
                            CartModel.create({
                                color,
                                size: size || 'no',
                                product,
                                quantity,
                                author: req.session.userid,
                                total: parseInt(item.price) * parseInt(quantity)
                            });
                        }
                        return res.json({type: 'success', msg: 'Yayyy ! the product was added to your cart' });
                    });
                } else {
                    return res.json({ type: 'error', msg: 'Whoops ! There is no product to add' });
                }
            });
    }

    // Update cart
    async updateCart(req, res)
    {
        const { product: cart_id, size, color, quantity, product_id} = req.body;
        await Product.findById(product_id, (err, item) => {
                        let updatedQty = quantity == 0 ? 1 : quantity;
                    CartModel.findOneAndUpdate({_id: cart_id}, {
                            size,
                            color,
                            quantity: updatedQty,
                            total: parseInt(item.price) * updatedQty
                        }, (err, result) => {
                        // console.log(err, result)
                        req.flash('success', 'Cart was successfully updated !');
                        req.flash('msgType', 'success');
                        return res.redirect('/user/cart')
                    });
            });
        

    }

    // Delete from cart
    delete(req, res)
    {
       const id = req.params.id;
       CartModel.findOneAndDelete({_id: id}, (err, deleted) => {
        if(!err && deleted)
        {
            req.flash('success', 'Successfully deleted !');
            req.flash('msgType', 'success');
        }
        return res.redirect('/user/cart');
    });
    }
}

module.exports = new Cart();