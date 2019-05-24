const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productImageSchema = new Schema({
    img_to: { type: Schema.Types.ObjectId, ref: 'Product' },
    image: String
});

const ProductImage = mongoose.model('ProductImage', productImageSchema);

module.exports = ProductImage;