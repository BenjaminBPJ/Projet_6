const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const MaskData = require('maskdata');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const emailMask = {
  maskWith: "*", 
  unmaskedStartCharactersBeforeAt: 0,
  unmaskedEndCharactersAfterAt: 200,
  maskAtTheRate: false
};

userSchema.plugin(uniqueValidator);
const maskedEmail = MaskData.maskEmail2(userSchema, emailMask);

module.exports = mongoose.model('User', userSchema);