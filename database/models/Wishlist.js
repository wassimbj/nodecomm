const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Wishlist', wishlistSchema);