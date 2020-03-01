const fs = require('fs');
// READ ALL TOURS
// JSON.parse() => it becomes a JavaScript object.
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  // if (req.params.id * 1 > tours.length || req.params.id !== undefined) {
  if (req.params.id * 1 > tours.length) {
    // status 404 is NOT FOUND
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next();
};

// Check if name or price is missing, send error when is missing
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Required name or price'
    });
  }
  next();
};

//////
// GET ALL TOURS -> GET method
exports.getAllTours = (req, res) => {
  //   console.log(req.requestTime);
  // status 200 is succeeded
  res.status(200).json({
    status: '200',
    results: tours.length,
    data: { tours }
  });
};

//////
// GET TOUR BY ID -> GET method
exports.getTour = (req, res) => {
  // console.log(req.params); // To check or read http://expressjs.com/en/5x/api.html#req.params

  // To convert string to number
  const id = req.params.id * 1;

  // Array.prototype.find() is returns the value of the first element in the provided array or read https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  const tour = tours.find(el => el.id === id);

  //////
  // If there isn't tour found or undefined so it's FALSE, to convert to TRUE because it's boolean
  // if (!tour) {
  //   // status 404 is NOT FOUND
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  // status 200 is succeeded
  res.status(200).json({
    status: 'Success found',
    data: { tour }
  });
};

//////
// Create a tour -> POST method
exports.createTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  // fs.writeFile(file, data[, options], callback)
  // ---
  // file is a filename where save to filename e.g. users.json
  // data is a file descriptor which is a data for save to filename
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      // status 201 is created success
      res.status(201).json({
        status: 'Success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

//////
// Update a tour by id -> PATCH method
exports.udpateTour = (req, res) => {
  // if (req.params.id * 1 > tours.length) {
  //   // status 404 is NOT FOUND
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  // status 200 is success
  res.status(200).json({
    status: 'Success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

//////
// Delete a tour by id -> DELETE method
exports.deleteTour = (req, res) => {
  // if (req.params.id * 1 > tours.length) {
  //   // status 404 is NOT FOUND
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  // status 204 is NO CONTENT to send for this request, but the headers may be useful.
  res.status(204).json({
    status: 'Deleted success',
    data: null
  });
};
