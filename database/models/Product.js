const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {type: String, required: [true, 'Please enter the title']},
    price: { type: Number, required: [true, 'Please enter the price']},
    original_price: { type: Number, required: [true, 'Original price is required'] },
    quantity: { type: Number, required: [true, 'Please enter the quantity']},
    category: { type: String, required: [true, 'Please select the category']},
    subcate: String,
    brand: String,
    colors: { type: Array, required: [true, 'Please enter the colors available']},
    sizes: Array,
    description: { type: String, required: [true, 'Please enter the description']},
    specifications: { type: String, required: [true, 'Please enter the specifications']},
    discount: {type: Schema.Types.ObjectId, ref: 'Discount', default: null},
    created_at: {type: Date, default: new Date()}
});

module.exports = mongoose.model('Product', productSchema);