const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cateSchema = new Schema({
    name: {type: String, required: [true, 'please enter the category name']},
    appear: {type: Number, default: 1},
    created_at: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Category', cateSchema);