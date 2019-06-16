const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');


const userSchema = new Schema({
    firstname: { type: String, required: [true, 'Please enter your first name'] },
    lastname: { type: String, required: [true, 'Please enter the last name'] },
    email: { type: String, unique: true, required: [true, 'Please enter the email'] },
    password: { type: String, required: [true, 'Please enter the password'] },
    image: { type: String },
    verified: {type: Boolean, default: false},
    created_at: { type: Date, default: new Date() }
});

userSchema.pre('save', function(next){
    bcrypt.hash(this.password, 10, (err, hashed) => {
        if (!err) {
            this.password = hashed;
            next();
        } else {
            console.log(err);
        }
    })
})

module.exports = mongoose.model('User', userSchema);