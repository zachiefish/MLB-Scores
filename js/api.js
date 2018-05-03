/*
    Functions for populating the page with the MLB API
*/

// Set the page loading state
function setLoading(loading) {
    if (loading) {
        $('#game-list').empty(); // Empty the current game list
        $('.loading-bar').removeClass('d-none'); // Make the loading bar visible
        $('.btn').prop('disabled', true); // Disable buttons
    } else {
        $('.loading-bar').addClass('d-none'); // Make the loading bar invisible
        $('.btn').prop('disabled', false); // Enable buttons
    }
}

// Give every tab on the page a unique id, otherwise they won't work
function fixTabs() {
    var games = $('.game-details').not($('.game-card .game-details'));
    
    // Loop through every set of tabs, and give them an index
    games.each(function(index) {
        $(this).find('.away-nav').attr('href', '#away-table' + index);
        $(this).find('.home-nav').attr('href', '#home-table' + index);
        $(this).find('#away-table').attr('id', 'away-table' + index);
        $(this).find('#home-table').attr('id', 'home-table' + index);
    })
}

// Make a call to the MLB API, and populate the page based on the selected date
function populate() {        
    setLoading(true); // Set the page to the loading state

    var date = getSelectedDate(); // Get the selected date

    // Format the URL according to the given date
    var requestURL = 'https://gd2.mlb.com/components/game/mlb/year_' + date.year + '/month_' + date.month + '/day_' + date.day + '/master_scoreboard.json';

    $.getJSON(requestURL, function(games) {
        games = games['data']['games']['game'];

        if (games === undefined) {
            $('#game-list').append('<h5 class="text-center m-3">No games today</h5>');
            setLoading(false);
            return;
        }
        if (games.length === undefined)
            games = [games]; // If only a single game happened that day, put it into an array so it doesn't break the rest of the function

        populateGames(games); // Populate games list
        setLoading(false); // Unset the page loading state
        fixTabs(); //We want our tabs to work
    })

}

// Populate the page with games for the day using a JSON-formatted list of games
function populateGames(games) {

    var template = $('#game-template').clone().removeAttr('id').removeClass('d-none'); // Copy the template and make it visible

    // Loop through every game in the JSON list
    for (let game of games) {
        var gameCard = template.clone(); // Create a new game card for the list

        // Get game data and add to listing
        var awayName = game['away_team_name'];
        if (awayName == 'American' || awayName == 'National') { // Add 'league' in case it's a National Leage vs American League game
            game['away_team_name'] = awayName + ' League';
            awayName = game['away_team_name'];
        }
        if (awayName == 'D-backs') { // Change 'D-backs' to 'Diamondbacks'
            game['away_team_name'] = 'Diamondbacks'; 
            awayName = game['away_team_name'];
        }
        gameCard.find('.away-name').text(awayName);

        var homeName = game['home_team_name'];
        if (homeName == 'American' || homeName == 'National') {
            game['home_team_name'] = homeName + ' League';
            homeName = game['home_team_name'];
        }
        if (homeName == 'D-backs') {
            game['home_team_name'] = 'Diamondbacks'; 
            homeName = game['home_team_name'];
        }
        gameCard.find('.home-name').text(homeName);

        if (game['linescore'] != undefined && game['linescore']['inning'] != undefined) { // Only add score and details if the game has a linescore and innings
            var awayRuns = game['linescore']['r']['away'];
            gameCard.find('.away-runs').text(awayRuns);

            var homeRuns = game['linescore']['r']['home'];
            gameCard.find('.home-runs').text(homeRuns);

            // Generate linescore and batter table
            populateLinescore(game, gameCard);
            // Only make games with a linescore clickable
            gameCard.addClass('clickable');
        }

        var status = game['status']['status']
        gameCard.find('.status').text(status);
        
        // Loop through every team in the team list to check if they have a logo
        $('#fav-team option').each(function() {
            if (awayName == $(this).val()) { // awayName is a valid team name
                gameCard.find('.away-logo').removeClass('d-none').attr('src', 'img/' + awayName + '.png'); // make image visible and add the corresponding logo URL
                gameCard.find('.away-name').css('margin-left', '0rem'); // change the spacing of the name
            }
            if (homeName == $(this).val()) { // homeName is a valid team name
                gameCard.find('.home-logo').removeClass('d-none').attr('src', 'img/' + homeName + '.png');// make image visible and add the corresponding logo URL
                gameCard.find('.home-name').css('margin-left', '0rem'); // change the spacing of the name
            }
        })

        // Highlight winning team
        if (parseInt(awayRuns) > parseInt(homeRuns)) {
            gameCard.find('.away-name, .away-runs').css('color', 'PaleGreen');
        }
        if (parseInt(awayRuns) < parseInt(homeRuns)) {
            gameCard.find('.home-name, .home-runs').css('color', 'PaleGreen');
        }
                    
        var favTeam = $('#fav-team').val();
        if (favTeam == awayName || favTeam == homeName) {
            $('#game-list').prepend(gameCard); // If one of the teams is a favourite team, place it in the beginning of the list
        } else {
            $('#game-list').append(gameCard); // Otherwise, place it at the end of the list
        }

        $('#game-list > .game-card').each(function() {
            $(this).find('.game-details').insertAfter($(this));
        })
    }
}

// Populate the game details pane that is revealed when a game is clicked
function populateLinescore(game, gameCard) {
    var details = gameCard.find('.game-details');
    var linescore = game['linescore'];

    // Fill in number of innings
    var table = '<thead><tr><th></th>';
    for (i = 0; i < linescore['inning'].length; i++) {
        table += '<th>' + (i+1) + '</th>';
    }
    table += '<th>R</th><th>H</th><th>E</th>'
    table += '</tr></thead><tbody>';

    // Fill in away team runs
    table += '<tr><th>' + game['away_name_abbrev'] + '</th>';
    for (i = 0; i < linescore['inning'].length; i++) {
        let runs = linescore['inning'][i]['away'];
        table += '<td>' + runs + '</td>';
    }
    table += '<td>' + linescore['r']['away'] + '</td>';
    table += '<td>' + linescore['h']['away'] + '</td>';
    table += '<td>' + linescore['e']['away'] + '</td>';
    table += '</tr>';

    // Fill in home team runs
    table += '<tr><th>' + game['home_name_abbrev'] + '</th>';
    for (i = 0; i < linescore['inning'].length; i++) {
        let runs = linescore['inning'][i]['home'] || '';

        if (i == 8 && runs == '')
            runs = 'x'; // If it's the final inning and the home team didn't have to bat, add an 'x' instead
        table += '<td>' + runs + '</td>';
    }
    table += '<td>' + linescore['r']['home'] + '</td>';
    table += '<td>' + linescore['h']['home'] + '</td>';
    table += '<td>' + linescore['e']['home'] + '</td>';
    table += '</tr></tbody>';

    // Store the game data directory for future use
    details.find('.game-data-directory').val(game['game_data_directory']);
    
    // Add table to DOM
    details.find('.linescore').append($(table));

    // Set the names for the team selection buttons
    details.find('.away-nav strong').text(game['away_team_name']);
    details.find('.home-nav strong').text(game['home_team_name']);
}

// Get boxscore.json, and populate the player tables in the game details view (this function is triggered whenever game details are opened)
function populatePlayers(gameDetails) {
    var gameDataDirectory = gameDetails.find('.game-data-directory').val();

    if (gameDataDirectory == '') // It will be empty if the players were already populated, so do nothing
        return;

    gameDetails.find('.loading-bar').removeClass('d-none'); // Make loading bar visible while everything loads
    
    // Get boxscore.json
    var requestURL = 'https://gd2.mlb.com' + gameDataDirectory + '/boxscore.json';
    $.getJSON(requestURL, function(boxscore) {
        boxscore = boxscore['data']['boxscore'];

        // Make player tables for both teams
        generatePlayerTables(boxscore, gameDetails, 'away');
        generatePlayerTables(boxscore, gameDetails, 'home');

        // Mark that the player tables were already generated by setting the game_data_directory to ''
        gameDetails.find('.game-data-directory').val('');
        // Hide loading bar
        gameDetails.find('.loading-bar').addClass('d-none');
    })

    
}

// Generate batting and pitching tables for either 'home' or 'away' team
function generatePlayerTables(boxscore, gameDetails, team) {
    var batters;
    var pitchers;

    // Get the correct batters and pitchers
    for (let players of boxscore['batting']) {
        if (players['team_flag'] == team)
            batters = players['batter'];
    }
    for (let players of boxscore['pitching']) {
        if (players['team_flag'] == team)
            pitchers = players['pitcher'];
    }

    // Construct batting table
    var table = '<thead><tr><th>Batter</th><th>AB</th><th>R</th><th>H</th><th>BB</th><th>RBI</th><th>AVG</th></tr></thead>';
    
    // Add all batters
    table += '<tbody>';
    for (let batter of batters) {
        table += '<tr>';
        table += '<td>' + batter['name_display_first_last'] + '</td>';
        table += '<td>' + batter['ab'] + '</td>';
        table += '<td>' + batter['r'] + '</td>';
        table += '<td>' + batter['h'] + '</td>';
        table += '<td>' + batter['bb'] + '</td>';
        table += '<td>' + batter['rbi'] + '</td>';
        table += '<td>' + batter['avg'] + '</td>';
        table += '</tr>';
    }
    table += '</tbody>';

    // Add batting table to DOM
    gameDetails.find('.' + team + '-batting').append($(table));


    // Construct pitching table
    var table = '<thead><tr><th>Pitcher</th><th>H</th><th>ER</th><th>BB</th><th>SO</th><th>HR</th><th>ERA</th></tr></thead>';
    
    // Add all pitchers
    table += '<tbody>';
    for (let pitcher of pitchers) {
        table += '<tr>';
        table += '<td>' + pitcher['name_display_first_last'] + '</td>';
        table += '<td>' + pitcher['h'] + '</td>';
        table += '<td>' + pitcher['er'] + '</td>';
        table += '<td>' + pitcher['bb'] + '</td>';
        table += '<td>' + pitcher['so'] + '</td>';
        table += '<td>' + pitcher['hr'] + '</td>';
        table += '<td>' + pitcher['era'] + '</td>';
        table += '</tr>';
    }
    table += '</tbody>';

    // Add pitching table to DOM
    gameDetails.find('.' + team + '-pitching').append($(table));
}