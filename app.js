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

const { csClass } = require('./csClass');
const { csClasses } = require('./classes');
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

/**
 * This will be the homepage for the app. Homepage will have a login link to sign in with their google account
 */
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/scheduling-app', (req, res) => {
    res.render('logIn', { loginLink: authUrl});
});

app.get('/googleoauthcallback', (req, res) => {
    /**
     * Get access tokens from Google after successful authentication and redirection
     */
    let code = req.query.code;
    oauth2Client.getToken(code, (error, tokens) => {
        if (!error) {
            // console.log(tokens);
            oauth2Client.credentials = tokens;
        }
    });
    // console.log('\n\n', oauth2Client);
    res.render('googleoauthcallback');
});

app.get('/cs-class-scheduling', (req, res) => {
    res.render('scheduling', {csClasses: csClasses});
});

// create a new calendar object to create events on the user's primary calendar
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// LA time zone
const LA = 'America/Los_Angeles';

// the user is redirected to this route if a cs class was successfully chosen
app.post('/cs-class-submission', (req, res) => {
    // access HTML form data with JSON
    let JSONstring = JSON.stringify(req.body);
    let entries = JSON.parse(JSONstring);
    // empty variables for app success or error
    let successString = ``, complainString = ``, scheduleConflict = false;

    // iterate through each class option
    Object.keys(entries).forEach(classIndex => {
        let currentClassOption = entries[classIndex];

        // skip classes that were not selected
        if (currentClassOption['index'] == null) {
            return;
        }

        // initialize empty event object
        let event = {
            summary: null,
            start: {
                dateTime: null,
                timeZone: LA,
            },
            end: {
                dateTime: null,
                timeZone: LA,
            },
            colorId: 11,
            recurrence: null,
            location: null,
            description: null,
        }

        // enter the zoom link and location values if the user inputted them
        if (currentClassOption['zoomLink'] != '') {
            event.description = currentClassOption['zoomLink'];
        }
        if (currentClassOption['location'] != '') {
            event.location = currentClassOption['location'];
        }
                
        let currentClass = csClasses[currentClassOption['index']];
        // the UNTIL property in RRULE needs a date in the format of YYYYMMDD
        let endDateStr = (String(currentClass.getEndDate.getFullYear()));
        let formatMonth, formatDay;

        if ((String(currentClass.getEndDate.getMonth() + 1)).length == 1) {
            formatMonth = '0' + (String(currentClass.getEndDate.getMonth() + 1));
        } 
        else {
            formatMonth = (String(currentClass.getEndDate.getMonth() + 1));
        }
        if ((String(currentClass.getEndDate.getDate())).length == 1) {
            formatDay = '0' + (String(currentClass.getEndDate.getDate()));
        } 
        else {
            formatDay = (String(currentClass.getEndDate.getDate()));
        }
        endDateStr = endDateStr.concat(formatMonth, formatDay);

        // fill in empty event object properties with the chosen class
        event.summary = currentClass.getName;
        event.start.dateTime = currentClass.getStartDate;
        event.end.dateTime = currentClass.getStartDateEndTime;
        event.recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=${currentClass.getClassDays};UNTIL=${endDateStr}`];

        
        // Check to see if the user is busy at the chosen time slot for the class
        calendar.freebusy.query({
            resource: {
                timeMin: event.start.dateTime,
                timeMax: event.end.dateTime,
                timeZone: LA,
                items: [{ id: 'primary' }],
            },
        }, (error, response) => {
            if (error) return console.error('Free Busy Query Error: ', error);
            // creates an array of events on the calendar that are also in the same allotted time slot
            const eventsArray = response.data.calendars.primary.busy;
            // console.log('How many events are already in time slot: ', eventsArray.length);
            // Check if there are no events on the calendar in the same time slot
            if (eventsArray.length == 0) {
                // insert a new calendar event
                return calendar.events.insert({
                    calendarId: 'primary',
                    resource: event
                }, error => {
                    if (error) return console.error('Calendar Event Creation Error: ', error);

                    return successString += `Google Calendar event for ${currentClass.getName} successfully created!\n`;
                });

                
            }
            // Complain to the user that they are busy on the allotted time slot in their primary calendar
            scheduleConflict = true;
            return complainString += `The app could not schedule your ${event.summary} class because you are busy from ${event.start.dateTime} to ${event.end.dateTime}.\n`;
        });
    });

    // console.log('complainString: ', complainString);
    // console.log('successString: ', successString);
    // console.log(scheduleConflict);
    // Respond to user that all the google calendar events were successfully created or complain if there's a schedule conflict
    if (scheduleConflict) {
        res.send(complainString);
    }
    else {
        res.send(successString);
    }
});