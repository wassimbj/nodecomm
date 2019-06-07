const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'User' },
    orders: Array,
    paid: { type: Number, default: 0 },
    total: Number,
    paid_at: Date,
    method: String,
    ship_to: { type: Schema.Types.ObjectId, ref: 'Shipping' },
    delivered: {type: Boolean, default: false},
    created_at: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Order', orderSchema);