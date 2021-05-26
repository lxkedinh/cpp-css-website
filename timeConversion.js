function convertTime(timeString) {
    // splits the string on white space to separate the actual time and the AM or PM
    let stringSplit = timeString.split(' ');
    // split the time string again into hours and minutes, splitting at the colon
    let timeSplit = stringSplit[0].split(':');
    let hours = timeSplit[0];
    let minutes = timeSplit[1];
    // check if PM time, then convert to 24 hour time
    if (stringSplit[1] == 'PM') {
        hours = (String)((Number)(hours) + 12);
    }

    return hours + ':' + minutes;
}

module.exports = { convertTime };

// console.log('before:\t' + '9:45 AM\t\t' + 'after:\t' + convertTime('9:45 AM'));
// console.log('before:\t' + '9:00 PM\t\t' + 'after:\t' + convertTime('9:00 PM'));
// console.log('before:\t' + '2:00 PM\t\t' + 'after:\t' + convertTime('2:00 PM'));