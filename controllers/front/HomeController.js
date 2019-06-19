const Product = require('../../database/models/Product');
const Brand = require('../../database/models/Brand');

class Home {

    index(req, res){

        Product.aggregate([
            {$match: {
                created_at: {
                    $gte: new Date(new Date() - (6 * 60 * 60 * 24 * 1000))
                }
            }},
            {
                $lookup: {
                    from: 'productimages',
                    localField: '_id',
                    foreignField: 'img_to',
                    as: 'images'
                }
            }
        ]).exec((err, products) => {
            Brand.find({ appear: 1}, (err, brands) => {
                console.log(products.length, '--', brands.length)
                res.render('front.index', {
                    products,
                    brands
                });
            })
        })


    }

}

module.exports = new Home();