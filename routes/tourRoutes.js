const express = require('express');

const tourController = require('./../controllers/tourController');

const router = express.Router();

// ROUTES
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.udpateTour)
  .delete(tourController.deleteTour);

module.exports = router;
