const Product = require('../database/models/Product');
const ProductImage = require('../database/models/ProductImage');

class Admin {

    index(req, res) {
        res.render('back.dashboard');
    }

    // Show create views
    create(req, res){
        const msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        return res.render('back.productCreate', {msgType, msg});
    }

    // Store the product in the DB
    store(req, res){
        const pImages = req.files;
        Product.create({
            title: req.body.name,
            price: req.body.price,
            quantity: req.body.qty,
            category: req.body.category,
            brand: req.body.brand,
            colors: req.body.colors.split(','),
            sizes: req.body.sizes.split(','),
            description: req.body.desc,
            specifications: req.body.spec
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
                return res.redirect('/admin/create');
            }else {
                const error = Object.keys(err.errors).map(key => err.errors[key].message);
                req.flash('danger', error)
                req.flash('msgType', 'danger');
                return res.redirect('/admin/create');
            }
        });
    }

}

module.exports = new Admin();