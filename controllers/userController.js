const fs = require('fs');
// READ ALL USERS
// JSON.parse() => it becomes a JavaScript object.
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

//////
// GET ALL USERS -> GET method
exports.getAllUsers = (req, res) => {
  // status 200 is succeeded
  res.status(200).json({
    status: '200',
    results: users.length,
    data: { users }
  });
};

//////
// GET USER BY ID -> GET method
exports.getUser = (req, res) => {
  // console.log(req.params); // To check or read http://expressjs.com/en/5x/api.html#req.params

  // To convert string to number
  const id = req.params.id * 1;

  // Array.prototype.find() is returns the value of the first element in the provided array or read https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  const user = users.find(el => el.id === id);

  // If there isn't tour found or undefined so it's FALSE, to convert to TRUE because it's boolean
  if (!user) {
    // status 404 is NOT FOUND
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  // status 200 is succeeded
  res.status(200).json({
    status: 'Success found',
    data: { user }
  });
};

//////
// Create a user -> POST method
exports.createUser = (req, res) => {
  // console.log(req.body); // Check it

  const newId = users[users.length - 1].id + 1;
  const newUser = Object.assign({ id: newId }, req.body);

  users.push(newUser);
  // fs.writeFile(file, data[, options], callback)
  // ---
  // file is a filename where save to filename e.g. users.json
  // data is a file descriptor which is a data for save to filename
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    err => {
      // status 201 is created success
      res.status(201).json({
        status: 'Success',
        data: {
          user: newUser
        }
      });
    }
  );
};

//////
// Update a user by id -> PATCH method
exports.updateUser = (req, res) => {
  if (req.params.id * 1 > users.length) {
    // status 404 is NOT FOUND
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  // status 200 is success
  res.status(200).json({
    status: 'Success',
    data: {
      user: '<Updated user here...>'
    }
  });
};

//////
// Delete a user by id -> DELETE method
exports.deleteUser = (req, res) => {
  if (req.params.id * 1 > users.length) {
    // status 404 is NOT FOUND
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  // status 204 is NO CONTENT to send for this request, but the headers may be useful.
  res.status(204).json({
    status: 'Deleted success',
    data: null
  });
};
