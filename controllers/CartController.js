const CartModel = require('../database/models/Cart');
const Product = require('../database/models/Product');
const ProductImage = require('../database/models/ProductImage');
class Cart{

    async index(req, res)
    {
        const msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        await CartModel.find({author: req.session.userid})
                .populate('product')
                .exec((err, result) => {
                    var images = {};
                    result.map(function(item){
                            ProductImage.findOne({ img_to: item.product._id }, function(err, img){
                                images[img.img_to] = img.image;
                            });
                    });
                    return res.render('front.cart', {
                        images,
                        result,
                        msg, msgType
                    });

                });
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
                    CartModel.findOne({ product: item._id, author: req.session.userid }, (errs, cart) => {
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