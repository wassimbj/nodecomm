const WishlistModel = require('../../database/models/Wishlist');
const Product = require('../../database/models/Product');

class Wishlist {
    
    // Add to wishlist
    create(req, res)
    {
        // get the product id
        const {product_id} = req.body;
        // check if there is a product with that id in the db
        Product.findById(product_id, (err, product) => {
            if(!err && product)
            {
                WishlistModel.findOne({author: req.session.userid, product: product_id}, (err, in_wishlist) => {
                    if (in_wishlist)
                    {
                        // Already in wishlist, that means delete it
                        WishlistModel.findOne({_id: in_wishlist._id}).remove().exec();
                        return res.json({action: 'remove', msg: true})

                    }else{
                        // Create
                        WishlistModel.create({
                            author: req.session.userid,
                            product: product_id,
                        }, (err, created) => {
                            if(!err && created)
                                return res.json({ action: 'create', msg: true })
                            else
                                return res.json({action: 'error', msg: 'login'})
                        });
                    }
                })
            }else{
                res.json('Oops ! there is no product found')
            }
        })
        // if there is add to wishlist

        // else display an error
    }
    // shop
    // signle
    // Delete from wishlist
    delete(req, res)
    {
        // 
    }
}

module.exports = new Wishlist();