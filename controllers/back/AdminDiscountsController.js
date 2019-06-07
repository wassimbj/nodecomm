const Product = require('../../database/models/Product')
const DiscountModel = require('../../database/models/Discount')
const mongoose = require('mongoose')

class Discount{

    // render the create discount page
    async create(req, res)
    {
        let msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        await Product.aggregate([
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
                    from: 'discounts',
                    localField: 'discount',
                    foreignField: '_id',
                    as: 'discount'
                }
            }
        ]).exec((err, products) => {
            // console.log(products)
            res.render('back.create_discount', {products, msg, msgType});
        })
    }

    // store discount in the DB
    async store(req, res)
    {
        let { discount, expire, products} = req.body,
            new_pids = [];

        // if(products == undefined)
        // {
            // req.flash('msgType', 'danger')
            // req.flash('danger', 'Please select the products')
            // res.redirect('back')
        // } else
        if (Array.isArray(products) && products.length > 0){
            products.map(p_id => {
                var id = mongoose.Types.ObjectId(p_id);
                new_pids.push(id)
            })
        } else if (products !== undefined && ! Array.isArray(products)){
            new_pids.push(mongoose.Types.ObjectId(products));
        }
        console.log(new_pids)

        // create the discount table
        await DiscountModel.create({
                products: new_pids,
                discount,
                expire
            }, (err, disc) => {
                if (err && !disc)
                {
                    console.log(err.errors)
                    let errors = Object.keys(err.errors).map(key => err.errors[key].message);
                    req.flash('msgType', 'danger')
                    req.flash('danger', errors)
                }else{
                    // console.log(disc)
                    new_pids.map(p_id => {
                        Product.findOne({_id: p_id}, (err, product) => {
                            console.log(err, product)
                            let new_price = product.original_price - (product.original_price * (disc.discount / 100));
                                Product.findOneAndUpdate({_id: p_id}, {
                                    price: new_price,
                                    discount: disc._id
                                }).exec()
                        })
                    })
                    req.flash('msgType', 'success')
                    req.flash('success', 'Great ! the discount was successfully created')
                }
                return res.redirect('back')
            })
        // calculate the new price
    }


}

module.exports = new Discount();