const Product = require('../../database/models/Product');
const ProductImage = require('../../database/models/ProductImage');

class Admin {

    // Show create views
    create(req, res){
        var msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        return res.render('back.productCreate', {msgType, msg});
    }

    // Store the product in the DB
    store(req, res){
        const pImages = req.files,
              {name, price, qty, category, brand, colors, sizes, desc, spec} = req.body;
        Product.create({
            title: name,
            price: price,
            original_price: price,
            quantity: qty,
            category: category,
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
            }else {
                const error = Object.keys(err.errors).map(key => err.errors[key].message);
                req.flash('danger', error)
                req.flash('msgType', 'danger');
                return res.redirect('back');
            }
        });
    }

}

module.exports = new Admin();