const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subCateSchema = new Schema({
    name: { type: String, required: [true, 'please enter the category name'] },
    appear: { type: Number, default: 1 },
    parent: {type: Schema.Types.ObjectId, ref: 'Category'},
    created_at: { type: Date, default: new Date() }
});

module.exports = mongoose.model('SubCategory', subCateSchema);