const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Define User Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    roomNo: { type: String, required: false, default: null },
    address: { type: String, required: true },
    birthdate: { type: Date, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    role: { type: String, enum: ['admin', 'tenant'], default: 'tenant' },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;