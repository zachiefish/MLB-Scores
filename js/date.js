/*
    Date helper functions
*/

// Converts JavaScript Date object to custom date object
function convertDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth()+1; // January is 0!
    var yyyy = date.getFullYear();

    // Add leading zeroes if necessary
    if(dd<10) {
        dd = '0'+dd
    } 
    if(mm<10) {
        mm ='0'+mm
    } 

    // custom date object
    return {
        day: dd,
        month: mm,
        year: yyyy
    }
}

// Increments the date by number of days (negative to decrement)
function incrementDate(date, increment) {
    time = new Date(date.year, date.month-1, date.day).getTime(); // Get the time in milliseconds since the Epoch
    dayMillis = 86400000; // Milliseconds in a day

    time = time + increment*dayMillis; // Increment the time

    return new Date(time); // Convert the date to our custom format
}

// Converts date object to string with format 'yyyy-mm-dd'
function dateToString(date) {
    return date.year + '-' + date.month + '-' + date.day
}

// Converts string with format 'yyyy-mm-dd' to date object
function parseDate(date_string) {
    var date = date_string.split('-');

    var yyyy = date[0];
    var mm = date[1];
    var dd = date[2];

    return {
        day: dd,
        month: mm,
        year: yyyy
    }
}

// Gets the currently selected date
function getSelectedDate() {
    return parseDate($('#date').val());
}
