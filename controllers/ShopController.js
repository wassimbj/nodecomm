"use strict";
const Product = require('../database/models/Product');
const Cart = require('../database/models/Cart');
// $gt = Greater Then
// $lt = Less Then
// $gte = Greater Then Or Equal
// $in = in array [1,2,,3,4,5,6] {$in: [10, 5, 20, 80]}
// $sort = {$sort: field: -1 for DESC and 1 for ASC}
// DESC(-1) From high to low
// ASC(1) from low to high
class Shop {
    constructor()
    {
        this.perpage = 2;
        this.skip = 0;
    }

    // Get all the filter opstions from the products table in the DB
    index(req, res){
        Product.aggregate([
            {$unwind: '$colors'},
            {
                $group: {
                            _id: null,
                            colors: { $addToSet: '$colors' },
                            brands: { $addToSet: '$brand' },
                            cates: { $addToSet: '$category' },
                            max: {$max: '$price'}
                            // min: {$min: '$price'}
                        }
                    },
                ]).exec((errs, data) => {
                    // console.log(data)
                    this.skip = 0; // init it to "0"
                    Product.countDocuments((err, count) => {
                        var links = [],
                            dataPerpage = Math.ceil(count / this.perpage);
                        for (var i = 1; i <= dataPerpage; i++)
                             links.push(i);
                        return res.render('front.shop', { data: data[0], dataPerpage, links });
                    })
                })
            // });
    }

    // Filter products
    filter(req, res)
    {
        // console.log('Filter = ', this.skip)
        var options = { $match: {} },
            sort = {};

        const { min, max, category, color, brand, sorting} = req.body;
        let colors = JSON.parse(color);
        let brands = JSON.parse(brand);
        let cates = JSON.parse(category);

        // filtering
        if(min || max)
            options.$match.price = { $gte: parseInt(min), $lte: parseInt(max)}
        if (colors.length > 0)
            options.$match.colors = { $in: colors }
        if (brands.length > 0)
            options.$match.brand = { $in: brands }
        if (cates.length > 0)
            options.$match.category = { $in: cates }

        // Sorting
        switch(sorting)
        {
            case 'lowPrice':
                sort.$sort = { price: 1 }
                break;
            case 'highPrice':
                sort.$sort = { price: -1 }
                break;
            case 'newest':
                sort.$sort = { created_at: -1 }
                break;
            default: sort.$sort = { price: 1 }
        }
        // res.json(options)
        // res.json(req.body)
        // console.log(sort)
        Product.aggregate([
            options,
            sort,
            {
                $lookup: {
                    from: 'productimages',
                    localField: '_id',
                    foreignField: 'img_to',
                    as: 'images'
                }
            },
            {$skip: this.skip},
            {$limit: this.perpage}
        ]).exec((err, products) => {
            // console.log(options)
            var output = '';
            products.map(product => {
                output += `
                    <div class="col-lg-4 col-md-4 col-sm-6" >
                        <div class="f_p_item">
                            <div class="f_p_img">
                                <img class="img-fluid" src="${product.images[0].image}" alt="">
                                <div class="p_icon">
                                    <a><i class="lnr lnr-heart"></i></a>
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

    // Data per page
    page(req, res)
    {
        // get the page number - 1
        const page = parseInt(req.body.page) - 1;
        // multiply this.perpage by page number
        // E.g: perpage = 10, page = 2(wich is 1), skip = 10
        this.skip = this.perpage * page;
        // console.log('Page = ', this.skip)
        res.json(true)
        // call filter_data()
        
    }
}

module.exports = new Shop();