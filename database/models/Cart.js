const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    color: {type: String, required: [true, 'Please select a color']},
    size: { type: String, default: 'no'},
    quantity: { type: Number, default: '1', required: ['true', 'Please choose the quantity'] },
    product: {type: Schema.Types.ObjectId, ref: 'Product'},
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    total: Number,
    paid: { type: Number, default: 0},
    created_at: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Cart', cartSchema);