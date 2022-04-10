const express = require('express');
const practitionerController = require('./controller/practitionerController');
const port = 9999;
const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text({ type: 'text/csv' }));
app.set('port', port);


app.listen(app.get('port'));
practitionerController(app);

console.log('Listening on port: ' + app.get('port'));

module.exports = app;