const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body); // or .save(req.body)
  // Replace selected code ! ⬇️
  const newUser = await User.create({
    name: req.body.name,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role

    //
    // Add more field, it should check in userModel.js because there's required
    // If there's not required field so it will not add here because it's a default or nothing maybe.
  });

  //   const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRES_IN
  //   });

  //// It's createSendToken
  //
  // const token = signToken(newUser._id);
  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: newUser
  // });
  ////
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  //   const email  = req.body.email;  when it is red, so change code like down
  //   const password  = req.body.password; when it is red, so change code like down
  const { email, password } = req.body; // It's better a line and save space 👽

  // 1) Check if  email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  // WHY .select('+password')? Because this password is hidden in userModel.js therefore this is show here
  // sign plus "+" means show all data
  // There's a problem when user (line 41) don't exist and it don't should check next line 45
  // Because for example, user.password is not gonna be available so i will leave a comment there and
  // line 55 should be in if-else in line 62
  // const correct = await user.correctPassword(password, user.password);

  // console.log(user); // Check if user shows all data with password

  //
  // IF user don't exist and don't run next step password
  // but if the user exists, then it will also run next step password and check if password is correct
  // If there's no user or there's no wrong password then create this error
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token
  //   // user
  // });
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  ////// 1) Getting token and check of it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  //// 2) Verificatnon token
  // Callback is gonna run as soon as the verification has been completed
  // promisify() is -> ????
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //// 3) Check if user still exists
  // Example:
  // If user has been deleted in the meantime? so the token will still exits BUT
  // if the user is not longer existent so I actually don't want to log him in, well..
  // or worse, what if the user has actually changed his password after the token has been issued?
  // well, that should also not work.
  // Example:
  // Imagine that someone stole the JSON web token from a user
  // But then, in order to protect against that the user changed his password and of source,
  // That old token was issued before password change should no longer be valid.
  // So it should not be accepted to access protected routes.
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this tokes does no longer exist.',
        401
      )
    );
  }

  // console.log(currentUser);

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  // Because there's a closure
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    ///////////////
    ///////////////

    //// What is .includes()?
    // examples:

    //const array1 = [1, 2, 3];
    //
    // console.log(array1.includes(2));
    // // expected output: true

    // const pets = ['cat', 'dog', 'bat'];
    //
    // console.log(pets.includes('cat'));
    // // expected output: true

    // console.log(pets.includes('at'));
    // // expected output: false
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this', 403)
      );
    }
    next();
  };
};

// First part is:
// That the user sends a post request to a forgot password route,
// only with this email address. This will then create a reset token and
// sent that to the email address that was provided. Just a simple, random token,
// NOT a JSON web token
//
// Second part is:
// The user then send that token from his email along with a new password in order to
// update his password.
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user  based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  // 2) Generate random reset jwt
  const resetToken = user.createPasswordResetToken();
  // await user.save();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  // Works both development and production. ⬇️
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you did not forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password reset token (valid for 10 minutes)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    // console.log(err);

    return next(
      new AppError('There was an error sending the email, try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user used on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  // 2) If you has not expired, and there's user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user

  // 4) Log the user in, send JWT
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token
  // });

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  ////
  // Remember that password updating functionality is only for logged-in users.
  ////
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // .select('+password') -> because it's not included in the output

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate -> Why didn't it does something like this?
  // will NOT work as intended
  // so check passwordConfirm: function

  // const token = signToken(user._id);
  // 4) Log user in, send JWT
  // res.status(200).json({
  //   status: 'Updated password successfully',
  //   token
  // });

  createSendToken(user, 200, res);
});
