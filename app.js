const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const expressEdge = require('express-edge');
const edge = require('edge.js');
// const cloudinary = require('cloudinary');
// const cloudinaryStorage = require('multer-storage-cloudinary');
// const multer = require('multer');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);

// const gateway = require('./lib/gateway');

const app = new express();

// static file (css, js ..)
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressEdge);
app.set('views', `${__dirname}/views`);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


// Connect to the database
mongoose.set('useFindAndModify', false);
const mongo_uri = process.env.MONGODB_URI || 'mongodb://localhost/nodeComm';
mongoose.connect(mongo_uri, { useNewUrlParser: true });
db = mongoose.connection;
db.once('open', () => { console.log('DB connected :)') });
db.on('error', (err) => { console.log(err) });

app.use(session({
    secret: 'just_put_whatever_here',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: db })
}));
app.use(flash());

// Cloudinary config
// cloudinary.config({
//     cloud_name: 'wassimbj',
//     api_key: '984761639488781',
//     api_secret: 'pzOuyNMKKwZEh14s0ahCYoWLPDc'
// });

// const storage = cloudinaryStorage({
//     cloudinary: cloudinary,
//     folder: "nodeComm",
//     allowedFormats: ["jpg", "png", 'svg', 'jpeg'],
//     transformation: [{ width: 500, height: 500, crop: "limit" }]
// });

// const imgparser = multer({storage: storage});

//######################## Bring all models #########################
const Cart = require('./database/models/Cart');


//######################## Bring all Controllers #########################
// Front (customer)
const HomeController = require('./controllers/front/HomeController');
const ShopController = require('./controllers/front/ShopController');
const WishlistController = require('./controllers/front/WishlistController');

// Back (Admin)
const AdminHomeController = require('./controllers/back/AdminHomeController');

//######################## Bring all Routes #########################
// Front
const mainShop = require('./routes/front/shop')
const userAuth = require('./routes/front/auth');
const userCart = require('./routes/front/cart');
const userShip = require('./routes/front/ship');
const userCheckout = require('./routes/front/checkout');
const userProfile = require('./routes/front/profile')

// Back 
const adminProducts = require('./routes/back/products')
const AdminCate = require('./routes/back/category')
const AdminBrands = require('./routes/back/brands')
const AdminOrders = require('./routes/back/orders')
const AdminDiscounts = require('./routes/back/discounts')

// ############### Front ##################
app.use('*', (req, res, next) => {
    edge.global('auth', req.session.userid);
    Cart.countDocuments({ author: req.session.userid, paid: 0}).exec((err, items_in_cart) => {
        edge.global('items_in_cart', items_in_cart);
    })
    next();
});

app.get('/', HomeController.index);

app.get('/contact', HomeController.contact_page)
app.post('/contact', HomeController.send_contact)

// Main shop
app.use('/shop', mainShop)

// get single product
app.get('/product/:name', ShopController.single)

// add to wishlist
app.post('/wishlist/add', WishlistController.create)

// User auth
app.use('/auth', userAuth);

// User cart
app.use('/user', userCart)

// User shipping
app.use('/user/shipping', userShip)

// Checkout
app.use('/user/checkout', userCheckout)

app.use('/user/profile', userProfile)
// ############### Back (Admin) ##################

app.get('/admin', AdminHomeController.index);

app.use('/admin/product', adminProducts)

app.use('/admin/category', AdminCate)

app.use('/admin/brands', AdminBrands)

app.use('/admin/orders', AdminOrders)

app.use('/admin/discounts', AdminDiscounts)

// 404 PAGE
app.use((req, res) => {
    res.status(404).render('front.404')
});



const port = process.env.PORT || '3000';
app.listen(port, () => {
    console.log('Server started on port ',port);
});