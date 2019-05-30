"use strict";
const Product = require('../database/models/Product');
const Cart = require('../database/models/Cart');
const WishlistModel = require('../database/models/Wishlist');
const mongoose = require('mongoose');
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
        this.perpage = 10;
        this.skip = 0;
        this.pages = 0;
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
                    this.skip = 0; //init it to "0"

                    Product.countDocuments((err, count) => {
                        var links = [],
                            pages = Math.ceil(count / this.perpage);
                            this.pages = pages;
                        for (var i = 1; i <= pages; i++)
                             links.push(i);
                        return res.render('front.shop', { data: data[0], pages, links });
                    })
                })
            // });
    }

    // Filter products
    filter(req, res)
    {
        // console.log('Skip = ', this.skip)
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
        const user_id = req.session.userid;
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

            {
                $lookup: {
                    from: 'wishlists',
                    localField: '_id',
                    foreignField: 'product',                  
                    as: 'wishlist'
                }
            },

           {
               $project:
               {
                   colors: 1,
                   sizes: 1,
                   created_at: 1,
                   title: 1,
                   price: 1,
                   quantity: 1,
                   category: 1,
                   brand: 1,
                   description:1,
                   specifications: 1,
                   images: '$images',
                   wishlist:
                   {
                       $filter: { 
                          input: '$wishlist',
                          as: 'wish',
                           cond: { $eq: ['$$wish.author', mongoose.Types.ObjectId(user_id)]}
                        }
                   }
               }
           },
         
            {$skip: this.skip},
            {$limit: this.perpage}
        ]).exec((err, products) => {
            // console.log(options)
            var output = '';
            products.map(product => {
                output += `<div class="col-lg-4 col-md-4 col-sm-6">
                            <div class="f_p_item">
                                <div class="f_p_img">
                                ${
                                    product.wishlist.length > 0 ?
                                        `<div class='in_wishlist'> <i class="lnr lnr-heart"></i> </div>`
                                    :
                                        `<div class='wishlist_badge'>  </div>`
                                }
                                    <img class="img-fluid" src="${product.images[0].image}" alt="">
                                    <div class="p_icon">
                                        <button class='add_to_wishlist' data-id='${product._id}'><i class="lnr lnr-heart"></i></button>
                                        <a href="/product/${product.title}"><i class="lnr lnr-cart"></i></a>
                                    </div>
                                </div>
                                <a href="/product/${product.title}"><h4>${product.title}</h4></a>
                                <h5>${product.price}</h5>
                            </div>
                        </div>`
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

        // 1## get the page number - 1
        var pageVal = parseInt(req.body.page);
        var page = pageVal - 1;

        if(pageVal > 0 && pageVal <= this.pages )
        {
            this.skip = this.perpage * page;
            res.json(true)
        }else
            res.json(false)
       
        // console.log(this.pages, page)
        // console.log('Page: ', page, ' - Skip: ', this.skip)

        // 2## multiply this.perpage by page number
        // ----- E.g: perpage = 10, page = 2(wich is 1), skip = 10
       
        // last ## call filter_data() in the jQuery
        
    }
}

module.exports = new Shop();