const Product = require('../../database/models/Product')
const DiscountModel = require('../../database/models/Discount')
const mongoose = require('mongoose')

class Discount{
    // render discounts view
    async index(req, res)
    {
        let msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        await DiscountModel.find((err, discounts) => {
            // console.log(discounts)
            return res.render('back.discounts', { discounts, msg, msgType})
        })
    }

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
            return res.render('back.create_discount', {products, msg, msgType});
        })
    }

    // store discount in the DB
    async store(req, res)
    {
        let { discount, expire, products} = req.body,
            new_pids = [];
        if (Array.isArray(products) && products.length > 0){
            products.map(p_id => {
                var id = mongoose.Types.ObjectId(p_id);
                new_pids.push(id)
            })
        } else if (products !== undefined && ! Array.isArray(products)){
            new_pids.push(mongoose.Types.ObjectId(products));
        }
        // console.log(new_pids)

        // create the discount table
        await DiscountModel.create({
                products: new_pids,
                discount,
                expire
            }, (err, disc) => {
                if (err && !disc)
                {
                    // console.log(err.errors)
                    let errors = Object.keys(err.errors).map(key => err.errors[key].message);
                    req.flash('msgType', 'danger')
                    req.flash('danger', errors)
                }else{
                    // console.log(disc)
                    new_pids.map(p_id => {
                        Product.findOne({_id: p_id}, (err, product) => {
                            // console.log(err, product)
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
               res.redirect('back')
            })
        // calculate the new price
    }

    // render edit view
    async edit(req, res)
    {
        let msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        await Product.aggregate([
            {$match: {discount: mongoose.Types.ObjectId(req.params.id)}},
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
            return res.render('back.edit_discount', { products, msg, msgType });
        })
    }

    // Update the discount
    // Method: POST
    async update(req, res)
    {
        let { id, discount, expire, products } = req.body,
            products_to_delete = [];
        if (Array.isArray(products) && products.length > 0) {
            products.map(p_id => {
                var id = p_id;
                products_to_delete.push(id)
            })
        } else if (products !== undefined && !Array.isArray(products)) {
            products_to_delete.push(products);
        }
        // console.log(req.body, products_to_delete)

        await DiscountModel.findOne({_id: id}, (err, disc) => {
                 let products_left = disc.products.filter(p_id => !products_to_delete.includes(p_id.toString()));
                 if(products_left.length === 0)
                 {
                     req.flash('msgType', 'danger')
                     req.flash('danger', 'You cant delete all the products, if you want just delete the discount !')
                    return res.redirect('/admin/discounts')
                 }
                 else{
                     DiscountModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(id)}, {
                         products: products_left,
                         discount,
                         expire
                     }, {runValidators: true}).exec((err, updated_disc) => {
                         if (err && !updated_disc) {
                             // console.log(err.errors)
                             let errors = Object.keys(err.errors).map(key => err.errors[key].message);
                             req.flash('msgType', 'danger')
                             req.flash('danger', errors)
                         } else {
                            //  console.log('Left: ', products_left, ' - To delete: ', products_to_delete)
                             products_left.map(p_id => {
                                 Product.findOne({ _id: p_id }, (err, product) => {
                                    //   console.log(err, product)
                                     var new_price = product.original_price - (product.original_price * (discount / 100));
                                     Product.findOneAndUpdate({ _id: p_id }, { price: new_price }).exec();
                                 })
                             })

                            if(products_to_delete.length > 0)
                            {
                                products_to_delete.map(p_id => {
                                    Product.findOne({ _id: mongoose.Types.ObjectId(p_id) }, (err, product) => {
                                        Product.findOneAndUpdate({_id: product._id}, {
                                            discount: null,
                                            price: product.original_price
                                        }).exec()
                                    })
                                })
                            }                        
                             req.flash('msgType', 'success')
                             req.flash('success', 'Great ! the discount was successfully created')
                         }
                         return res.redirect('back')
                     })
                 }
                     
        })
    }


    // Delete discount function
    async delete(req, res)
    {
        let id = req.params.id;
     await DiscountModel.findOneAndDelete({_id: id}, (err, disc) => {
                Product.find({discount: disc._id}, (err, products) => {
                    products.map(product => {
                        Product.findOneAndUpdate({_id: product._id}, {
                            price: product.original_price,
                            discount: null
                        }).exec()
                    })
                });
            })
            req.flash('msgType', 'success')
            req.flash('success', 'Successfully deleted !')
            res.redirect('/admin/discounts')
    }

}

module.exports = new Discount();