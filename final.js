"use strict";


/*
*   Root URL for database
*/
let root_url = "http://comp426.cs.unc.edu:3001/";


/*
*   Retrieves the promise returned by an AJAX request for a particular data endpoint.
*   If id provided, get data for that id.
*   Otherwise, get data for every instance of that endpoint.
*/
let get = (endpoint, id) => {
    let url = root_url + endpoint;
    if (id) {
        url += '/' + id;
    }
    return $.ajax(url, {
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        error: display_login_page
    });
}


/*
*   Method for retrieving FILTERED data from a particular endpoint.
*   The parameters 'filters' provided in form:
*           {
*           filter_parameter_1: filter value_1,
*           filter parameter_2: filter_value_2,
*              ...
*              }
*/
let get_filtered = (endpoint, filters) => {
    let input = {
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        data: {},
        error: display_login_page
    }

    /*
    *  For each filter parameter, wrap into 'filter[parameter]'
    *  and insert key/value into input.data
    */
    for (let key in filters){
        input.data['filter[' + key + ']'] = filters[key];
    }

    return $.ajax(root_url + endpoint, input);
}


/*
*   Log- in method:
*   Retrieves
*/
let log_in = (user, pass) => {
    let username = user? user : String($('#login_user').val());
    let password = pass? pass : String($('#login_pass').val());
    return $.ajax(root_url + 'sessions', {
        type: 'POST',
        data: {
            user: {
                username:  username,
                password: password,
            }
        },
        success: (response) => {
            console.log('Logged in');
            after_login();
        },
        error:(response) => {
            console.log('Error logging in');
            console.log(response);
            $('#login_user').val()
            $('#login_pass').val()
            $('#msg_div').text('Error: bad username or password');
        }
    })
}


/*
*   Upon page load:
*/
$(() => {
    display_login_page();
    log_in('granthr', 730047576).then(() => {
        find_instances('Charlotte', 'San Francisco');
        get_random_flight();
    });
});


/*
*   Display login page and assign appropriate event handlers for login function
*/
let display_login_page = () => {
    let body = $('body').empty();
    let login_div = $('<div id="login_div"><h1>Book a Flight</h1></div>');
    $('<p>Username: </p><input type="text" id="login_user"><br>').appendTo(login_div);
    $('<p>Password: </p><input type="text" id="login_pass"><br>').appendTo(login_div);
    let button = $('<button id="login_btn">Login</button>').appendTo(login_div);
    $('<div id="msg_div"></div>').appendTo(login_div);
    button.click(log_in);
    body.append(login_div);
};


let filter_airlines = (filter) => {
    $('#search_results .flight').each((i, flight) => {
        if($(flight).find('.airline div').text().toLowerCase().includes(filter.toLowerCase())){
            $(flight).show();
        } else {
            $(flight).hide();
        }
    });
};

/*
*   Construct HTML for a flight search including parameters and results;
*   Assign corresponding functionality
*/
let construct_search = () => {
    let body = $('#currentdisplay').empty();
    let search = $('<div id= "search"></div>').appendTo(body);
    let search_parameters = $('<div id = "search_parameters>"</div>').appendTo(search);
    search_parameters.append('<div id = "frominput"><p>from </p><input type="text" id="from_city" placeholder = "New Orleans"></div>');
    search_parameters.append('<div id = "toinput"><p>to </p><input type="text" id="to_city" placeholder = "Miami"><br></div>');
    $('<button id="search_btn">Search</button>').appendTo(search_parameters).on('click', find_instances);
    let filter = $('<div id = "filterdiv"><p>airlines </p><input type="text" id="airline_filter"><br></div>').appendTo(search_parameters);
    $('#airline_filter').on('input', function() {
        filter_airlines($(this).val());
    });

    let search_display = $('<div id = "search_display"></div>').appendTo(search);
    search_display.append('<div id = "search_results"></div>');
};


/*
*   Node for a directed graph; has data, parent nodes and child nodes.
*/
function Node(data, name){
    this.data = data;
    this.adjacent = [];
}


let makeNodes = (data_array, name) => {
    let nodes = [];
    $(data_array).each((i, element) => {
        nodes[i] = new Node(element, name);
    });
    return nodes;
};

/*
*   Search for user-queried instances (occurrences of flights), acquire and
*   link relevant data using directed graph nodes, and display the results.
*/
let find_instances = (to, from) => {
    let search_results = $('#search_results');

    let make_header = () => {
        let search_header = $('<tr id = "sort_options"></tr>');
        search_results.empty();

        function compare(a, b){
            if(a > b) {
                return 1;
            }
            else if(a < b) {
                return -1;
            }
            else return 0;
        }

        let name_sort = () => {
            search_header.remove();
            let compareName = function(a, b){
                let $a = $(a).find('.airline div').text();
                let $b = $(b).find('.airline div').text();
                return compare($a, $b);
            }

            let flights = search_results.children('.flight');
            flights = flights.sort(compareName);
            make_header();
            flights.detach().appendTo(search_results);
        };

        search_header.append($('<th id = "airline_sort"></th>').append($('<div></div>')
            .text('Airline:'))).click((e) => {
                name_sort();
        });

        search_header.append($('<th id = "date_sort"></th>').append($('<div></div>')
            .text('Date:')));

        search_header.append($('<th id = "departure_time_sort"></th>').append($('<div></div>')
            .text('Departure Time:')));

        search_header.append($('<th id = "arrival_time_sort"></th>').append($('<div></div>')
            .text('Arrival Time:')));

        search_header.append($('<th id = "departure_code_sort"></th>').append($('<div></div>')
            .text('From:')));

        search_header.append($('<th class = "arrival_code_sort"></th>').append($('<div></div>')
            .text('To:')));

        search_results.append(search_header);
    };

    make_header();


    /*
    *   Retrieve departure/arrival airports matching the specified cities.
    *   (these functions return AJAX Promises)
    */
    let get_departure_airports = get_filtered("airports", {
        'city': to? to : $('#from_city').val()
    });

    let get_arrival_airports = get_filtered("airports", {
        'city': from? from : $('#to_city').val()
    });

    /*
    *   Wait until both the departure and arrival airports have been retrieved
    */
    Promise.all([get_departure_airports, get_arrival_airports]).then(([departure_list, arrival_list]) => {

        /*
        *   Wrap the arrays of airport information into nodes
        */
        let departure_nodes = makeNodes(departure_list, 'airport');
        let arrival_nodes = makeNodes(arrival_list, 'airport');

        /*
        *   For each combination of departure and arrival airports, retrieve matching flights
        */
        $(departure_nodes).each((i, departure_node) => {
            $(arrival_nodes).each((j, arrival_node) => {
                get_flights(departure_node, arrival_node);
            });
        });
    });


    /*
    *   For this particular departure/arrival combination, retrieve a list of flights
    */
    let get_flights = (departure_node, arrival_node) => {
        get_filtered("flights", {
            'departure_id': departure_node.data.id,
            'arrival_id': arrival_node.data.id,
        }).then((flight_list) => {
            $(flight_list).each((i, flight) => {
                let flight_node = new Node(flight);
                flight_node.adjacent.departure = departure_node;
                flight_node.adjacent.arrival = arrival_node;
                get_info(flight_node);
            });
        });
    };


    let get_info = (flight_node) => {
        let get_instances = get_filtered("instances", {
            'flight_id': flight_node.data.id,
        });
        let get_plane = get('planes', flight_node.data.plane_id);
        let get_airline = get('airlines', flight_node.data.airline_id);
        Promise.all([get_instances, get_plane, get_airline]).then(([instances, plane, airline]) => {
            let plane_node = new Node(plane);
            flight_node.adjacent.plane = plane_node;
            plane_node.adjacent.flight = flight_node;

            let airline_node = new Node(airline);
            airline_node.adjacent.flight = flight_node;
            flight_node.adjacent.airline = airline_node;

            let instance_nodes = makeNodes(instances);
            $(instance_nodes).each((i, instance_node) => {
                instance_node.adjacent.flight = flight_node;
                display_flight(instance_node);
            });
        });
    };


    let display_flight = (instance_node) => {
        if (instance_node.data['is_cancelled']) {
            return;
        }
        let flight_node = instance_node.adjacent.flight;
        let plane_node = flight_node.adjacent.plane;
        let airline_node = flight_node.adjacent.airline;
        let departure_node = flight_node.adjacent.departure;
        let arrival_node = flight_node.adjacent.arrival;

        let instance = instance_node.data;
        let flight = flight_node.data;
        let plane = plane_node.data;
        let airline = airline_node.data;
        let departure = departure_node.data;
        let arrival = arrival_node.data;

        let displayrow = $('<tr class = "flight"></tr>').click(() => {
            make_game(instance_node);
        });
        displayrow.data('instance_id', instance.id);
        displayrow.data('flight_id', flight.id);
        displayrow.data('plane_id', plane.id);
        displayrow.data('airline_id', airline.id);
        displayrow.data('departure_id', departure.id);
        displayrow.data('arrival_id', arrival.id);

        displayrow.append($('<td class = "airline container"></td>').append($('<div></div>')
            .text(airline['name'])));

        displayrow.append($('<td class = "date container"></td>').append($('<div></div>')
            .text(instance['date'])));

        displayrow.append($('<td class = "departure time container"></td>').append($('<div></div>')
            .text(flight['departs_at'].substring(11, 16))));

        displayrow.append($('<td class = "arrival time container"></td>').append($('<div></div>')
            .text(flight['arrives_at'].substring(11, 16))));

        displayrow.append($('<td class = "departure code container"></td>').append($('<div></div>')
            .text(departure['code'])));

        displayrow.append($('<td class = "arrival code container"></td>').append($('<div></div>')
            .text(arrival['code'])));

        $('#search_results').append(displayrow);
    };
};


/*
*   Perform after successful login
*/
let after_login = () => {
    $("body").empty().append('<div id = \'nav\'><div class = \'nav\' id=\'booknav\'><h3>Book Tickets</h3></div><div ' +
        'class = \'nav\' id = \'gamenav\'><h3>Play Game</h3></div><div class = \'nav\' id = \'ticketnav\'><h3>' +
        'View Tickets</h3></div></div><div id="currentdisplay"></div>');
    construct_search();
}


/*
*   Retrieve a sorted list of seats from
*/
let get_instance_seats = (instance_id) => {
    return get("instances", instance_id)

        .then((response) => {
            return get("flights", response['flight_id']);
        })

        .then((response) => {
            return get_filtered("seats", {
                'plane_id': response['plane_id']
            });
        })

        .then((response) => {
            response.sort((a, b) => {
                return (a.row !== b.row) ? a.row - b.row : a['number'].localeCompare(b['number']);
            });

            return response;
        });
};


let make_game = (instance_node) => {
    console.log(instance_node);
    let flight_node = instance_node.adjacent['flight'];
    let departure = flight_node.adjacent['departure'].data;
    let arrival = flight_node.adjacent['arrival'].data;

    var lat1 = parseFloat(departure.latitude);
    var lon1 = parseFloat(departure.longitude);
    var lat2 = parseFloat(arrival.latitude);
    var lon2 = parseFloat(arrival.longitude);

    let lat_center = (lat1 + lat2) / 2;
    let lon_center = (lon2 + lon2) / 2;

    $('body').empty();
    let game_html = '<div id= \"thing\"> To Win a Free flight, guess the distance of the flight! ' +
        '</div><div id="map"></div><div class=\"guessing\"><form>Guess the Distance:<br><input type="number" ' +
        'name="distance" id="distance" min="0"></form><button type="text" class="submit">Submit</button></div>';

    $('body').append(game_html);

    let initMap = () => {
        let map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: lat_center, lng: lon_center},
            zoom: 3,
            mapTypeId: 'terrain'
        });

        var lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            //path: 'M 0,-5 A  1,1 0 0 1 1,-4 L 1,-1 5,1 5,2 1,1 1,3 2,4 2,5 0,4  0,4 -2, 5 -2,4, -1,3 -1,1 -5,2 -5,1 -1,-1 -1,-4 0,-5',
            scale: 3,
            strokeColor: 'red'
        };



        let line = new google.maps.Polyline({
            path: [{lat: lat1, lng: lon1}, {lat: lat2, lng: lon2}],
            icons: [{
                icon: lineSymbol,
                offset: '50%',

            }],
            map: map
        });
        animatePlane(line);
    }

    function animatePlane(line) {
        var count = 0;
        window.setInterval(function() {
            count = (count + 1) % 200;

            var icons = line.get('icons');
            icons[0].offset = (count / 2) + '%';
            line.set('icons', icons);
        }, 100);
    }

    initMap();

    $('.submit').on('click', function() {
        //event.preventDefault();
        let guess = $('#distance').val();
        let actual_distance = getDistanceFromLatLonInKm(lat1, lon1, lat2,lon2);
        console.log(guess);
        console.log(actual_distance);

        let accuracy_variance = actual_distance * 0.99;
        if ((Math.abs(guess-actual_distance)) < accuracy_variance) {
            show_ticket(true);
        } else {
            show_ticket(false);}

    });



// This example adds an animated symbol to a polyline.



//https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates-shows-wrong
    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        let R = 6371; // Radius of the earth in km
        let dLat = deg2rad(lat2-lat1);  // deg2rad below
        let dLon = deg2rad(lon2-lon1);
        let a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);

        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        let d = R * c; // Distance in km
        //document.getElementById('thing').innerHTML = d;


        return d;


    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }
}

let show_ticket = (won) => {

};


let get_random_flight = () => {
    let flights = get('flights');
    flights.then((flights) => {
        let pickedflight = flights[Math.floor(Math.random()*flights.length)];
        console.log(pickedflight);
        let departure_airport = get('airports', pickedflight.departure_id).then((departure) => {
            console.log(departure);
        })
        let arrival_airport = get('airports', pickedflight.arrival_id).then((arrival) =>{
            console.log(arrival);
        });
    })
};
