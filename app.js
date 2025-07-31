const express = require('express');
const app = require('./src/api/user')

app.get('/', (req, res) => {
  res.send('<h1>Hello from your Express.js server!!</h1>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API listening at http://localhost:${PORT}`);
})
  
// app.get('/', (req, res) => {
//   res.send('<h1>Hello from your Express.js server!!</h1>');
// });
  
// app.listen(8000, () => {
//   console.log('Server listening on port 8000');
// });