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
let log_in = (username, password) => {
    $.ajax(root_url + 'sessions', {
        type: 'POST',
        data: {
            user: {
                username:  username? username : $('#login_user').val(),
                password: password? password : $('#login_pass').val()
            }
        },
        success: after_login,
        error: () => {
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
    log_in('granthr', 730047576);
    // find_instances('New Orleans', 'Miami');
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
}


/*
*   Construct HTML for a flight search including parameters and results;
*   Assign corresponding functionality
*/
let construct_search = () => {
    let body = $('body').empty();
    let search = $('<div id= "search"></div>').appendTo(body);
    let search_parameters = $('<div id = "search_parameters>"</div>').appendTo(search);
    search_parameters.append('<p>From (city): </p><input type="text" id="from_city"><br>');
    search_parameters.append('<p>To (city): </p><input type="text" id="to_city"><br>');
    search_parameters.append('<p>Min Date: </p><input type="text" id="min_date"><br>');
    search_parameters.append('<p>Max Date: </p><input type="text" id="max_date"><br>');
    search_parameters.append('<p>Min Time: </p><input type="text" id="min_time"><br>');
    search_parameters.append('<p>Max Time: </p><input type="text" id="max_time"><br>');
                                                                            // TODO: link function with forms
    $('<button id="search_btn">Search</button>').appendTo(search_parameters).on('click', find_instances);
    let search_display = $('<div id = "search_display"></div>').appendTo(search);
    search_display.append('<h1>Results:</h1><br>');
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
let find_instances = () => {
	let from_city = $('#from_city').val();
	let to_city = $('#to_city').val();

	console.log(from_city);
	console.log(to_city);
    /*
    *   Retrieve departure/arrival airports matching the specified cities.
    *   (these functions return AJAX Promises)
    */
    let get_departure_airports = get_filtered("airports", {
        'city': from_city
    });

    let get_arrival_airports = get_filtered("airports", {
        'city': to_city
    });

    /*
    *   Wait until both the departure and arrival airports have been retrieved
    */
    Promise.all([get_departure_airports, get_arrival_airports]).then(([departure_list, arrival_list]) => {
        $('#search_results').empty();
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
                get_flights(departure_node, arrival_node)
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

        let display_div = $('<div class = "flight"></div>');
        display_div.data('instance_id', instance.id);
        display_div.data('flight_id', flight.id);
        display_div.data('plane_id', plane.id);
        display_div.data('airline_id', airline.id);
        display_div.data('departure_id', departure.id);
        display_div.data('arrival_id', arrival.id);

        $('<span class = "airline"></span>').text(airline['name']).appendTo(display_div);
        $('<span class = "date"></span>').text(instance['date']).appendTo(display_div);
        $('<span class = "departure_time"></span>').text(flight['departs_at']).appendTo(display_div);
        $('<span class = "arrival_time"></span>').text(flight['arrives_at']).appendTo(display_div);
        $('<span class = "departure_code"></span>').text(departure['code']).appendTo(display_div);
        $('<span class = "arrival_code"></span>').text(arrival['code']).appendTo(display_div);

        $('#search_results').append(display_div);
    };
};





/*
*   Perform after successful login
*/
let after_login = () => {
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
