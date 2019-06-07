const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discountSchema = new Schema({
    products: {type: Schema.Types.ObjectId, ref: 'Product', required: [true, 'Please choose the produtcs']},
    discount: {type: Number, required: [true, 'Please enter the discount amount !']},
    expire: {type: Date, required: [true, 'Please choose the expiration date !']},
    created_at: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Discount', discountSchema);