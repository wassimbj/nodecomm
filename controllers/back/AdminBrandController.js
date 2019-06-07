const Brand = require('../../database/models/Brand')
const cloudinary = require('cloudinary');

class AdminBrand {

    index(req, res)
    {
        var msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        Brand.find((err, brands) => {
            res.render('back.brands', {brands, msgType, msg})
        })
    }

    // render the create brand view
    create(req, res) {
        var msgType = req.flash('msgType'),
            msg = req.flash(msgType);
        res.render('back.create_brand', {msg, msgType});
    }


    // Store the brand into the DB
    store(req, res)
    {
        // image
        const image = req.file;
         // const {name, appear} = req.body;
            // console.log(image)
        Brand.create({
            ...req.body,
            image: image.secure_url,
            img_id: image.public_id
        }, (err, brand) => {
            // console.log(err, brand)
            if(!err && brand)
            {
                req.flash('msgType', 'success');
                req.flash('success', 'Brand was successfully created')
            }else{
                const errors = Object.keys(err.errors).map(key => err.errors[key].message)
                req.flash('msgType', 'danger');
                req.flash('danger', errors)
            }
                res.redirect('back')
        })

        
    }

    // edit brand
    edit(req, res)
    {
        var new_image = req.file,
        { brand_id, img_id, name, appear,} = req.body;
            var data = {name, appear};

            if(new_image !== undefined)
            {
                data.image = new_image.secure_url;
                data.img_id = new_image.public_id;
                cloudinary.v2.uploader.destroy(img_id, (err, result) => console.log(err, result));
            }
            console.log(data)
            Brand.findOneAndUpdate({ _id: brand_id }, data, { runValidators: true })
                .exec((err, newBrand) => {
                    console.log('ERROR: ', err, ' - ', newBrand)
                        if(!err && newBrand)
                        {
                            req.flash('msgType', 'success')
                            req.flash('success', 'The brand was successfully updated !')
                        }else{
                            const errors = Object.keys(err.errors).map(key => err.errors[key].message)
                            req.flash('msgType', 'danger')
                            req.flash('danger', errors)
                        }
                    res.redirect('back')
                })
    }

    // delete brand
    delete(req, res)
    {
        const id = req.params.id;
        Brand.findByIdAndDelete(id)
            .exec((err, brand) => {
                req.flash('msgType', 'success')
                req.flash('success', `${brand.name} was successfully deleted !`);
                res.redirect('/admin/brands')
            })
    }

}

module.exports = new AdminBrand();