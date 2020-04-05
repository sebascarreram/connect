// It's a build-in node module so no need to install crypto
const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

////////////////////

//// Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true, // exAMplE@exAmple.com -> example@example.com
    maxlength: [50, 'Your email must have less or equal then 50 characters'],
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // hidde password in getAllUser or getUser by ID
    validate: [
      validator.isAlphanumeric,
      'It must only contains alpha and numeric characters wihout space'
    ]
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only works on CREATE and SAVE !
      validator: function(el) {
        return el === this.password; // abc === abc => true. abc === axy => false
      },
      message: 'Passwords are not same'
    }
  },
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true, // "    Hello world.     " <- delete space
    maxlength: [40, 'A user name must have less or equal then 40 characters']
  },
  lastname: {
    type: String,
    required: [true, 'Please tell us your lastname'],
    trim: true,
    maxlength: [40, 'A lastname must have less or equal then 40 characters']
  },
  age: {
    type: Number,
    trim: true,
    default: 18
  },
  birthday: {
    type: Date,
    default: new Date()
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  // 1000 = 1 second
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to the current
  // this.find({ active: true });
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  // If this field is null or undefined so won't run here
  if (this.passwordChangedAt) {
    // console.log(this.passwordChangedAt, JWTTimestamp);
    // output: 020-03-01T00:00:00.000Z  1585692264

    // const changedTimestamp = this.passwordChangedAt.getTime();
    // console.log(changedTimestamp, JWTTimestamp);
    // output: 583020800000 1585692264

    // const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    // console.log(changedTimestamp, JWTTimestamp);
    // output: 1583020800 1585692264

    // parseInt() -> Integer
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    // output: 1583020800 1585692264

    return JWTTimestamp < changedTimestamp;
    // 100 < 200 -> true
    // 300 < 200 -> false
    // -
    // False means NOT change
    // True means changed!
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  // { resetToken: 'here is original reset token which it's random Hex string } 'Go the encrypted here'
  // { resetToken: 'xxxxxxxx' } 'xxxxxxxxx'

  // To work for 10 minutes
  // + 10 milliseconds * 60 seconds * 1000 milliseconds
  // 20 * 60 * 1000
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // this.passwordResetExpires = new Date(new Date() + 10 * 60 * 1000);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

// const userTest = new Username({
//   username: 'sofiacm',
//   email: 'muneca@example.com',
//   name: 'Sofia Carrera',
//   age: 26
// });

// userTest
//   .save()
//   .then(con => {
//     console.log(con);
//   })
//   .catch(err => {
//     console.log('ERROR 💥 :', err.message);
//   });
