const express = require('express');
const bodyParser = require('body-parser');
// const path = require('path');
const mongoose = require('mongoose');
const expressEdge = require('express-edge');
const edge = require('edge.js');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);

// var braintree = require('braintree');
// var router = express.Router(); // eslint-disable-line new-cap
const gateway = require('./lib/gateway');

const app = new express();

// static file (css, js ..)
app.use(express.static('public'));
app.use(expressEdge);
app.set('views', `${__dirname}/views`);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


// Connect to the database
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost/nodeComm', { useNewUrlParser: true });
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
cloudinary.config({
    cloud_name: 'wassimbj',
    api_key: '984761639488781',
    api_secret: 'pzOuyNMKKwZEh14s0ahCYoWLPDc'
});

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "nodeComm",
    allowedFormats: ["jpg", "png", 'svg', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
});

const imgparser = multer({storage: storage});

//######################## Bring all models #########################
const Product = require('./database/models/Product');
const ProductImage = require('./database/models/ProductImage');

//######################## Bring all Controllers #########################
const HomeController = require('./controllers/HomeController');
const ShopController = require('./controllers/ShopController');
const AdminController = require('./controllers/AdminController');
// const UserController = require('./controllers/UserController');
// const CartController = require('./controllers/CartController');
// const ShippingController = require('./controllers/ShippingController');
// const CheckoutController = require('./controllers/CheckoutController');

//######################## Bring all Routes #########################
const userAuth = require('./routes/auth');
const userCart = require('./routes/cart');
const userShip = require('./routes/ship');
const userCheckout = require('./routes/checkout');

// ############### Front ##################
app.use('*', (req, res, next) => {
    edge.global('auth', req.session.userid);
    next();
});

app.get('/', HomeController.index);

app.get('/shop', ShopController.index.bind(ShopController));

app.post('/shop', ShopController.filter.bind(ShopController));

app.get('/product/:name', ShopController.single)

// User auth
app.use('/auth', userAuth);

// User cart
app.use('/user', userCart)

// User shipping
app.use('/user/shipping', userShip)

// Checkout
app.use('/user/checkout', userCheckout)


// ############### Back (Admin) ##################

app.get('/admin', AdminController.index);

app.get('/admin/create', AdminController.create);

app.post('/admin/create', imgparser.array('img', 5), AdminController.store);






const port = '3000';
app.listen(port, () => {
    console.log('Server started on port ',port);
});