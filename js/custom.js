$(document).ready(function() {

    // Runs on the first load of the page
    $(function() {
        // Initialize datepicker and set to today's date
        $('#display-date').datepicker({
            defaultDate: 0,
            altField: '#date',
            altFormat: 'yy-mm-dd',
            dateFormat: 'D, M d yy',
            changeMonth: true,
            changeYear: true
        }).datepicker('setDate', new Date());

        // Enable all tooltips
        $('[data-toggle="tooltip"]').tooltip();

        populate(); // Populates the page with data from today's games
    })

    // Re-populate the page whenever the date or favourite team is changed
    $('#display-date, #fav-team').on('change', function() {
        populate();
    })

    // Decrement date button
    $('#date-back').on('click', function() {
        var date = getSelectedDate();
        var new_date = convertDate(incrementDate(date, -1));

        $('#date').val(dateToString(new_date)); //  Set new date
        $('#display-date').datepicker('setDate', incrementDate(date, -1));

        populate(); // Update game list
    })
    // Increment date button
    $('#date-forward').on('click', function() {
        var date = getSelectedDate();
        var new_date = convertDate(incrementDate(date, 1));

        $('#date').val(dateToString(new_date)); //  Set new date
        $('#display-date').datepicker('setDate', incrementDate(date, 1));

        populate(); // Update game list
    })

    // Whenever a game is clicked and the details are opened
    $('#game-list').on('click', '.clickable', function() {
        // Collapse all detail panes
        $('.game-details').collapse('hide')
        // Toggle clicked pane
        let gameDetails = $(this).next('.game-details')
        gameDetails.collapse('toggle');
        // Populate player tables if needed
        populatePlayers(gameDetails);
    })
})