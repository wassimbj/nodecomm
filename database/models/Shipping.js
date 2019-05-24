const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shipSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    country: {type: String, required: [true, 'Please select your country']},
    city: { type: String, required: [true, 'Please enter your city'] },
    state: { type: String, required: [true, 'Please enter your state'] },
    address: { type: String, required: [true, 'Please enter your address'] },
    zip: { type: String, required: [true, 'Please enter the zip code'] },
    message: String,
    used: {type: Number, default: 0},
    created_at: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Shipping', shipSchema);