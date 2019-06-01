const Cate = require('../../database/models/Category')
const SubCate = require('../../database/models/SubCategory')

class Category {

    index(req, res)
    {
        Cate.aggregate([
            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_id',
                    foreignField: 'parent',
                    as: 'children'
                }
            }
        ]).exec((err, cates) => {
            // console.log(cates)
            var msgType = req.flash('msgType'),
                    msg = req.flash(msgType);
            res.render('back.categories', {cates, msg, msgType});
        });
    }

    // render create view
    create(req, res)
    {
         Cate.find((err, cates) => {

            // console.log(err, cates)
                var msgType = req.flash('msgType'),
                    msg = req.flash(msgType);
            return res.render('back.create_cate', {
                cates,
                msgType, msg
            })
        })
    }

    // create the category
    store(req, res)
    {
        // get cate type
        const {name, parent, appear} = req.body;
        // check if its sub or main
        if(parent == 'main')
        {
            Cate.create({
                name,
                appear
            }, (err, created) => {
                console.log(err)
                if(err)
                {
                    const error = Object.keys(err.errors).map(key => err.errors[key].message);
                    req.flash('danger', error)
                    req.flash('msgType', 'danger')
                }else{
                    req.flash('success', 'Successfully created the category')
                    req.flash('msgType', 'success')
                }
                return res.redirect('back')
            })
        }else{
            SubCate.create({
                name,
                parent,
                appear
            }, (err, created) => {
                if (err) {
                    const error = Object.keys(err.errors).map(key => err.errors[key].message);
                    req.flash('danger', error)
                    req.flash('msgType', 'danger')
                } else {
                    req.flash('success', 'Successfully created the sub-category')
                    req.flash('msgType', 'success')
                }
                return res.redirect('back')
            })
        }
    }

    // Delete
    delete(req, res)
    {
        const type = req.params.type,
              id = req.params.id;

        if(type == 'c')
        {
            Cate.findById(id).remove().exec((err, cate) => {
                req.flash('success', `${cate.name} was successfully deleted !`)
                req.flash('msgType', 'success')
                res.redirect('/admin/category')
            });
        }else if(type == 's')
        {
            SubCate.findById(id).remove().exec((err, sub) => {
                req.flash('success', `${sub.name} was successfully deleted !`)
                req.flash('msgType', 'success')
                res.redirect('/admin/category')
            });
        }
    }

    // edit
    edit(req, res)
    {
        const type = req.params.type;
        if(type == 'c')
        {
            const {cate_id, cate_name, cate_appear} = req.body;
            Cate.findOneAndUpdate({_id: cate_id}, {
                name: cate_name,
                appear: cate_appear
            }, { runValidators: true }, (error, resp) => {
                if (!error && resp) {
                    req.flash('success', 'Category is updated !');
                    req.flash('msgType', 'success');
                } else {
                    const errors = Object.keys(error.errors).map(key => error.errors[key].message);
                    req.flash('danger', errors);
                    req.flash('msgType', 'danger');
                }
                return res.redirect('back');
            })
        }else if(type == 's')
        {
            const { subcate_id, subcate_name, subcate_appear } = req.body;
            SubCate.findOneAndUpdate({ _id: subcate_id }, {
                name: subcate_name,
                appear: subcate_appear
            }, { runValidators: true }, (error, resp) => {
                if (!error && resp) {
                    req.flash('success', 'Category is updated !');
                    req.flash('msgType', 'success');
                } else {
                    const errors = Object.keys(error.errors).map(key => error.errors[key].message);
                    req.flash('danger', errors);
                    req.flash('msgType', 'danger');
                }
                return res.redirect('back');
            })
        }
    }

}

module.exports = new Category();