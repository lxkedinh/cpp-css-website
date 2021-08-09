let express = require('express');
let router = express.Router();

// POST class submission page.
router.post('/', (req, res) => {
    // access HTML form data with JSON
    res.send(JSON.stringify(req.body));
    let JSONstring = JSON.stringify(req.body);
    let entries = JSON.parse(JSONstring);
    // empty variables for app success or error
    let successString = ``, complainString = ``, scheduleConflict = false;

    // iterate through each class option
    Object.values(entries).forEach(index => {
        let currentClass = csClasses[index - 1];
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




    // Object.values(entries).forEach(classIndex => {
    //     let currentClassOption = entries[classIndex];

    //     // skip classes that were not selected
    //     if (currentClassOption['index'] == null) {
    //         return;
    //     }

        

    //     // enter the zoom link and location values if the user inputted them
    //     if (currentClassOption['zoomLink'] != '') {
    //         event.description = currentClassOption['zoomLink'];
    //     }
    //     if (currentClassOption['location'] != '') {
    //         event.location = currentClassOption['location'];
    //     }
                
        
    // });

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
})

module.exports = router;