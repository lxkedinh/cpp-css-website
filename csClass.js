// import time conversion function to get 24 hour time format for all classes
let { convertTime } = require('./timeConversion'); 

/**
 * @class A CS class At Cal Poly Pomona
 * @param {String} name - the name of the class
 * @param {String} catalogNumber - the catalog number for the class, ie. '2600' in CS 2600 (String because course numbers can include
 * L for lab classes)
 * @param {Number} sectionNumber - the section number for the class, ie. CS 2600-01 for Section 1 of CS 2600 
 * @param {String} startDate - a datestring in the form of YYYY-MM-DD, ie. Jan. 1 2021 is 2021-01-01
 * @param {String} startTime - string in the format of 'HH:MM' PM in 12 hour time, the constructor will then convert to 24 hour
 * time, ie. 4PM being 16:00
 * @param {String} endDate - a datestring in the form of YYYY-MM-DD, ie. Jan. 1 2021 is 2021-01-01
 * @param {String} endTime - string in the format of HH:MM in 24 hour time, ie. 4PM being 16:00
 * @param {String} professor - the professor's name
 * @param {String} classDays - the days of the class in a two character sequence separated by commas as follows:
 *      - "MO" for Monday
 *      - "TU" for Tuesday
 *      - "WE" for Wednesday
 *      - "TH" indicates Thursday
 *      - "FR" indicates Friday
 *      - "SA" indicates Saturday
 */
class csClass {
    constructor(name, catalogNumber, sectionNumber, startDate, startTime, endDate, endTime, professor, classDays) {
        /**
         * @private
         */
        this.name = name;
        this.catalogNumber = catalogNumber;
        this.sectionNumber = sectionNumber;

        // the first day of class
        this.start = new Date(startDate);
        // the time that the class starts
        let convertedStartTime = convertTime(startTime);
        let startTimeSplit = convertedStartTime.split(':');
        this.start.setHours(startTimeSplit[0]);
        this.start.setMinutes(startTimeSplit[1]);
        
        // the last day of class
        this.end = new Date(endDate);
        // the time that the class ends
        this.endTime = new Date(startDate);
        let convertedEndTime = convertTime(endTime);
        let endTimeSplit = convertedEndTime.split(':');
        this.endTime.setHours(endTimeSplit[0]);
        this.endTime.setMinutes(endTimeSplit[1]);
        
        this.professor = professor;
        this.classDays = classDays;
    }

    // getter methods
    get getName() {
        return this.name;
    }

    get getCatalogNumber() {
        return this.catalogNumber;
    }

    get getSectionNumber() {
        return this.sectionNumber;
    }

    get getStartDate() {
        return this.start;
    }

    get getStartTime() {
        return this.start.getHours() + ':' + this.start.getMinutes();
    }

    get getEndDate() {
        return this.end;
    }

    get getStartDateEndTime() {
        return this.endTime;
    }

    get getEndTime() {
        return this.endTime.getHours() + ':' + this.endTime.getMinutes();
    }

    get getProfessor() {
        return this.professor;
    }

    get getClassDays() {
        return this.classDays;
    }

    // setter methods
    set setName(newName) {
        this.name = newName;
    }

    set setCatalogNumber(courseNum) {
        this.catalogNumber = courseNum;
    }

    set setSectionNumber(section) {
        this.sectionNumber = section;
    }

    set setStartDate(date) {
        this.start.startDate.setDate(date);
    }

    set setStartTime(newStartTime) {
        let newStartTimeSplit = newStartTime.split(':');
        this.start.setHours(newStartTimeSplit[0]);
        this.start.setMinutes(newStartTimeSplit[1]);
    }

    set setEndDate(newEndDate) {
        this.end.endDate.setDate(newEndDate);
    }

    set setEndTime(newEndTime) {
        let newEndTimeSplit = newEndTime.split(':');
        this.endTime.setHours(newEndTimeSplit[0]);
        this.endTime.setMinutes(newEndTimeSplit[1]);
    }

    set setProfessor(newProf) {
        this.professor = newProf;
    }

    set setClassDays(newDays) {
        this.classDays = newDays;
    }

    // toString() to represent the class in text form to display on the web app
    toString() {
        return `'${this.name} Section ${this.sectionNumber} taught by ${this.professor}\'`;
    }
}

// export method from node.js
module.exports = {
    csClass: csClass
}