const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {type: String, required: [true, 'Please enter the title']},
    price: { type: Number, required: [true, 'Please enter the price']},
    original_price: { type: Number, required: [true, 'Original price is required'] },
    quantity: { type: Number, required: [true, 'Please enter the quantity']},
    category: { type: String, required: [true, 'Please enter the category']},
    brand: { type: String, required: [true, 'Please enter the brand']},
    colors: { type: Array, required: [true, 'Please enter the colors available']},
    sizes: Array,
    description: { type: String, required: [true, 'Please enter the description']},
    specifications: { type: String, required: [true, 'Please enter the specifications']},
    discount: {type: Schema.Types.ObjectId, ref: 'Discount', default: null},
    created_at: {type: Date, default: new Date()}
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;