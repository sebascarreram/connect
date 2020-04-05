// const fs = require('fs');
const User = require('../models/userModel');
// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// READ ALL USERS
// JSON.parse() => it becomes a JavaScript object.
// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
// );

//////
// GET ALL USERS -> GET method
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // status 200 is succeeded
  const users = await User.find();

  if (!users || users.length === 0) {
    return next(new AppError('There is not users yet', 404));
  }

  res.status(200).json({
    status: 'Success',
    results: users.length,
    data: { users }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTed password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const udpatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: udpatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    success: 'Success',
    data: null
  });
});

//////
// GET USER BY ID -> GET method
exports.getUser = catchAsync(async (req, res, next) => {
  // console.log(req.params); // To check or read http://expressjs.com/en/5x/api.html#req.params

  // To convert string to number
  // const id = req.params.id * 1;

  // Array.prototype.find() is returns the value of the first element in the provided array or read https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  // const user = users.find(el => el.id === id);

  // // If there isn't tour found or undefined so it's FALSE, to convert to TRUE because it's boolean
  // if (!user) {
  //   // status 404 is NOT FOUND
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(`No User found whit that ID: ${req.params.id}`, 404)
    );
  }
  // status 200 is succeeded
  res.status(200).json({
    status: 'Success found',
    data: { user }
  });
});

//////
// Create a user -> POST method
exports.createUser = catchAsync(async (req, res, next) => {
  // console.log(req.body); // Check it
  // const newId = users[users.length - 1].id + 1;
  // const newUser = Object.assign({ id: newId }, req.body);
  // users.push(newUser);
  // // fs.writeFile(file, data[, options], callback)
  // // ---
  // // file is a filename where save to filename e.g. users.json
  // // data is a file descriptor which is a data for save to filename
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/users.json`,
  //   JSON.stringify(users),
  //   () => {
  //     // status 201 is created success
  //     res.status(201).json({
  //       status: 'Success',
  //       data: {
  //         user: newUser
  //       }
  //     });
  //   }
  // );
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'Created user successfully',
    data: {
      user: newUser
    }
  });
});

//////
// Only for administrator to update all of the users data
// Update a user by id -> PATCH method
exports.updateUser = catchAsync(async (req, res, next) => {
  // if (req.params.id * 1 > users.length) {
  //   // status 404 is NOT FOUND
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(
      new AppError(`No user found with that ID ${req.params.id}`, 404)
    );
  }

  // status 200 is success
  res.status(200).json({
    status: 'Success',
    data: {
      user
    }
  });
});

//////
// Delete a user by id -> DELETE method
exports.deleteUser = catchAsync(async (req, res, next) => {
  // if (req.params.id * 1 > users.length) {
  //   // status 404 is NOT FOUND
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError(`No user found that ID: ${req.params.id}`, 404));
  }
  // status 204 is NO CONTENT to send for this request, but the headers may be useful.
  res.status(204).json({
    status: 'Deleted success',
    data: null
  });
});
