const Product = require('../database/models/Product');
const Cart = require('../database/models/Cart');

class Shop {
    index(req, res){
        Product.aggregate([
            {
                $lookup: {
                    from: 'productimages',
                    localField: '_id',
                    foreignField: 'img_to',
                    as: 'images'
                }
            }
        ]).exec((err, resp) => {
            const products = resp;
            return res.render('front.shop', { products });
        });
    }

    single(req, res){
        Product.aggregate([
            { $match: { 'title': req.params.name } },
            {
                $lookup: {
                    from: 'productimages',
                    localField: '_id',
                    foreignField: 'img_to',
                    as: 'images'
                }
            }
        ]).exec((err, resp) => {
            const msgType = req.flash('msgType'),
                msg = req.flash(msgType)
            return res.render('front.single-product', {
                msg,
                msgType,
                product: resp[0],
            });
        });
        //res.json(req.params.name);
    }

}

module.exports = new Shop();