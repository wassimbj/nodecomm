const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const brandSchema = new Schema({
    name: {type: String, required: [true, 'please enter the brand name']},
    image: { type: String, required: [true, 'upload the brand image !']},
    img_id: { type: String, required: true},
    appear: {type: Number, default: 0},
    created_at: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Brand', brandSchema);