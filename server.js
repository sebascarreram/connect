const app = require('./app');

const port = 3000;
// For connections on the specified host and port.
// http://127.0.0.1:3000
app.listen(port, () => {
  console.log(`App running on port ${port}...💥`);
});
