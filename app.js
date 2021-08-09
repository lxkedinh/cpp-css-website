const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
require('dotenv').config();
const app = express();
const PORT = 5500;

// set viewing engine for express application
app.set('view engine', 'ejs');
// url parser
app.use(bodyParser.urlencoded({extended: true}));

const { google }  = require('googleapis');
const { oauth2 } = require('googleapis/build/src/apis/oauth2');

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    // the url the user will be redirected to after sucessful authentication
    'http://localhost:5500/googleoauthcallback'
);
// generate a url that asks the permissions that the app needs to access the user's Google Calendar
const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
});
app.listen(PORT, () => {
    console.log(`Web server created at 127.0.0.1:${PORT} for CS Class Calendar Scheduling App.`);
});

// Load stylesheets, javascripts, and images
app.use(express.static(path.join(__dirname, 'public')));
// create a new calendar object to create events on the user's primary calendar
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
// LA time zone
const LA = 'America/Los_Angeles';

/**
 * Routers
 */
const schedulingRouter = require('./routes/scheduling');
const submissionRouter = require('./routes/submission');
/**
 * Routes
 */
app.get('/', (req, res) => {
    res.render('index', { loginLink: authUrl });
});
app.get('/googleoauthcallback', (req, res) => {
    // Get access tokens from Google after successful authentication and redirection
    let code = req.query.code;
    oauth2Client.getToken(code, (error, tokens) => {
        if (!error) {
            // console.log(tokens);
            oauth2Client.credentials = tokens;
        }
    });
    res.redirect('/cs-class-scheduling');
})
app.use('/cs-class-scheduling', schedulingRouter);
app.use('/cs-class-submission', submissionRouter);