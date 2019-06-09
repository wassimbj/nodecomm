const ProductModel = require('../../database/models/Product');
const ProductImage = require('../../database/models/ProductImage');
const Category = require('../../database/models/Category');
const Brand = require('../../database/models/Brand');
const mongoose = require('mongoose')

class Product {

    // display all products
    index(req, res) {
        var msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        ProductModel.aggregate([
            {
                $lookup: {
                    from: 'productimages',
                    localField: '_id',
                    foreignField: 'img_to',
                    as: 'images'
                }
            }
        ]).exec((err, products) => {
            return res.render('back.products', { products, msgType, msg })
        })
    }

    // Show create views
    create(req, res) {
        var msgType = req.flash('msgType'),
            msg = req.flash(msgType);
       
        Brand.find((err, brands) => {
            Category.aggregate([
                {
                    $lookup: {
                        from: 'subcategories',
                        localField: '_id',
                        foreignField: 'parent',
                        as: 'sub'
                    }
                }
            ]).exec((err, cates) => {
                // console.log(cates)
                return res.render('back.productCreate', { msgType, msg, brands, cates });
            })
        })
    }

    // Store the product in the DB
    async store(req, res) {
        const pImages = req.files,
            { name, price, qty, category, subc, brand, colors, sizes, desc, spec } = req.body;
        // console.log(req.body)
        await ProductModel.create({
            title: name,
            price: price,
            original_price: price,
            quantity: qty,
            category: category[0],
            subcate: subc,
            brand: brand,
            colors: colors.split(','),
            sizes: sizes.split(','),
            description: desc,
            specifications: spec
        }, (err, result) => {
            if (!err) {
                pImages.forEach(elem => {
                    // console.log(ProductImage);
                    ProductImage.create({
                        img_to: result._id,
                        image: elem.secure_url
                    });
                });
                req.flash('success', 'Yayy! the product was created'),
                    req.flash('msgType', 'success');
                return res.redirect('back');
            } else {
                // console.log(err);
                const error = Object.keys(err.errors).map(key => err.errors[key].message);
                req.flash('danger', error)
                req.flash('msgType', 'danger');
                return res.redirect('back');
            }
        });
    }

    // render the edit product view
    // method: GET
    async edit(req, res)
    {
        var msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        await ProductModel.aggregate([
            {
                $lookup: {
                    from: 'productimages',
                    localField: '_id',
                    foreignField: 'img_to',
                    as: 'images'
                }
            }
        ]).exec((err, product) => {
            Brand.find((err, brands) => {
                Category.aggregate([
                    {
                        $lookup: {
                            from: 'subcategories',
                            localField: '_id',
                            foreignField: 'parent',
                            as: 'sub'
                        }
                    }
                ]).exec((err, cates) => {
                    // console.log(cates)
                    return res.render('back.edit_product', {
                        product: product[0],
                        brands,
                        cates,
                        msgType, msg
                    })
                })
            })
        })
    }

    // Update the product
    // Method: POST
    async update(req, res)
    {
        // console.log(req.body)
        const id = mongoose.Types.ObjectId(req.body.id),
            { name, price, qty, colors, sizes, desc, spec } = req.body;
        // get the product and discount
        ProductModel.findOne({_id: id}).populate('discount')
        .exec((error, product) => {
            // console.log(product.discount, '------', product)
            var discounted_price = price;
            if(product.discount !== null)
                discounted_price = price - (price * (product.discount.discount / 100));
            else
                discounted_price = price;
            
            ProductModel.findOneAndUpdate({_id: id}, {
                title: name,
                price: discounted_price,
                original_price: price,
                quantity: qty,
                colors: colors.split(','),
                sizes: sizes.split(','),
                description: desc,
                specifications: spec
            }).exec((err, updated_product) => {
                if(!err)
                {
                    req.flash('msgType', 'success');
                    req.flash('danger', 'The product was successfully updated')
                }else{
                    const errors = Object.keys(err.errors).map(key => err.errors[key].message);
                    req.flash('msgType', 'danger');
                    req.flash('danger', errors)
                }
                return res.redirect('back');
            })

        })
        // update the product
    }

    // Delete product
    async delete(req, res)
    {
        let id = mongoose.Types.ObjectId(req.params.id)
       await ProductModel.findByIdAndDelete(id, (err, result) => {
                console.log(result)
                if(!err)
                {
                    req.flash('msgType', 'success');
                    req.flash('danger', `Product was successfully deleted`)
                }else{
                    console.log(err)
                }
                return res.redirect('/admin/product');
            })
    }
}

module.exports = new Product();