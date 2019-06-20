const Controller = require('../Controller')

const Product = require('../../database/models/Product');
const Brand = require('../../database/models/Brand');

class Home extends Controller{

    constructor()
    {
        super();
    }

    // render homepage
    index(req, res){

        Product.aggregate([
            {$match: {
                created_at: {
                    $gte: new Date(new Date() - (6 * 60 * 60 * 24 * 1000))
                }
            }},
            {
                $lookup: {
                    from: 'productimages',
                    localField: '_id',
                    foreignField: 'img_to',
                    as: 'images'
                }
            }
        ]).exec((err, products) => {
            Brand.find({ appear: 1}, (err, brands) => {
                console.log(products.length, '--', brands.length)
                res.render('front.index', {
                    products,
                    brands
                });
            })
        })


    }

    // render contact page
    contact_page(req, res)
    {
        let msgType = req.flash('msgType'),
            msg = req.flash(msgType),
            data = req.flash('data');
        res.render('front.contact', {msg, msgType, data: data[0]})
    }

    // send contact data to the admin
    send_contact(req, res)
    {
        let {name, email, msg} = req.body;
        // console.log(req.body)
        let validate = new Promise((resolve, reject) => {
            if(name.length == 0)
                reject('Please enter your name')
            else if(email.length == 0)
                reject('Please enter your email')
            else if (email.length > 0){
                super.valid_email(email, (valid) => {
                    if(!valid)
                        reject('Your email is not valid !')
                });
            }
            else if(msg.length < 5)
                reject('Message must be greater then 5 characteres')


            resolve('Success');
        })

        // console.log(validate)

        validate.then((data) => {
            super.sendmail(email, `${name} needs help !`, msg, (result) => {
                if (result) {
                    req.flash('msgType', 'success')
                    req.flash('success', 'Your message was sent! we will get back to you as soon as possible !');
                } else {
                    req.flash('msgType', 'danger')
                    req.flash('danger', 'Whoops ! something went wrong, please try again, later');
                }
                return res.redirect('/contact')
            })
            
        })
        .catch((err) => {
            req.flash('msgType', 'danger')
            req.flash('danger', err);
            req.flash('data', req.body)
            return res.redirect('/contact')
        });
    }

}

module.exports = new Home();