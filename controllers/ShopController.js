"use strict";
const Product = require('../database/models/Product');
const Cart = require('../database/models/Cart');
// $gt = Greater Then
// $lt = Less Then
// $gte = Greater Then Or Equal
// $in = in array [1,2,,3,4,5,6] {$in: [10, 5, 20, 80]}

class Shop {
    constructor()
    {
        // Init
    }
    // Render shop view
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
            // var colors = '', brands = '', cates = '';
                Product.aggregate([
                    {$unwind: '$colors'},
                    {
                        $group: {
                            _id: null,
                            colors: { $addToSet: '$colors' },
                            brands: { $addToSet: '$brand' },
                            cates: { $addToSet: '$category' },
                        }
                    },
                ]).exec((errs, data) => {
                    return res.render('front.shop', { products, data: data[0] });
                })
            });
    }

    // Filter products
    filter(req, res)
    {
        var options = { $match: {} }
        const { min, max, category, color, brand} = req.body;
        let colors = JSON.parse(color);
        let brands = JSON.parse(brand);
        let cates = JSON.parse(category);

        if(min || max)
            options.$match.price = { $gte: parseInt(min), $lte: parseInt(max)}
        if (colors.length > 0)
            options.$match.colors = { $in: colors }
        if (brands.length > 0)
            options.$match.brand = { $in: brands }
        if (cates.length > 0)
            options.$match.category = { $in: cates }
        
        // res.json(options)
        // res.json(req.body)

        Product.aggregate([
            options,
            {
                $lookup: {
                    from: 'productimages',
                    localField: '_id',
                    foreignField: 'img_to',
                    as: 'images'
                }
            }
        ]).exec((err, products) => {
            console.log(options)
            var output = '';
            products.map(product => {
                output += `
                    <div class="col-lg-4 col-md-4 col-sm-6" >
                        <div class="f_p_item">
                            <div class="f_p_img">
                                <img class="img-fluid" src="${product.images[0].image}" alt="">
                                <div class="p_icon">
                                    <a href="#"><i class="lnr lnr-heart"></i></a>
                                    <a href="/product/${product.title}"><i class="lnr lnr-cart"></i></a>
                                </div>
                            </div>
                            <a href="/product/${product.title}"><h4>${ product.title }</h4></a>
                            <h5>${product.price}</h5>
                        </div>
                    </div>
                `
            });

            res.json(output);
        });
            // <div class="col-lg-4 col-md-4 col-sm-6" >
            //     <div class="f_p_item">
            //         <div class="f_p_img">
            //             <img class="img-fluid" src="{{product.images[0].image}}" alt="">
            //             <div class="p_icon">
            //                 <a href="#"><i class="lnr lnr-heart"></i></a>
            //                 <a href="/product/{{product.title}}"><i class="lnr lnr-cart"></i></a>
            //             </div>
            //         </div>
            //         <a href="/product/{{product.title}}"><h4>{{ product.title }}</h4></a>
            //         <h5>${{ product.price }}</h5>
            //     </div>
            // </div>

    }

    // Single product
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