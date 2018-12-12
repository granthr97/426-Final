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
        success: after_login,
        error:(response) => {
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
        find_instances('Miami', 'New Orleans');
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

    $('<div id = "filterdiv"><p>airlines</p><input type="text" id="airline_filter"><br></div>').appendTo(search_parameters);
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

let name_order = 1;
let date_order = 1;
/*
*   Search for user-queried instances (occurrences of flights), acquire and
*   link relevant data using directed graph nodes, and display the results.
*/
let find_instances = (to, from) => {
    let search_results = $('#search_results');

    let make_header = () => {
        let search_header = $('<tr id = "sort_options"></tr>');
        search_results.empty();

        function compare(a, b, order){
            if(a > b) {
                return 1 * order;
            }
            else if(a < b) {
                return -1 * order;
            }
            else return 0;
        }

        let name_sort = () => {
            search_header.remove();
            let compareName = function(a, b){
                let $a = $(a).find('.airline div').text();
                let $b = $(b).find('.airline div').text();
                return compare($a, $b, name_order);
            }

            let flights = search_results.children('.flight');
            flights = flights.sort(compareName);
            make_header();
            flights.detach().appendTo(search_results);
            name_order *= -1;
        };

        let time_sort = () => {
            search_header.remove();

            let compareTime = function(a, b){
                let $a = $(a).find('.time div').text();
                let $b = $(b).find('.time div').text();
                return compare($a, $b, date_order);
            };

            let compareDate = function(a, b){
                let $a = $(a).find('.date div').text();
                let $b = $(b).find('.date div').text();

                let date_compare = compare($a, $b, date_order);
                if (date_compare != 0) {
                    return date_compare;
                } else {
                    return compareTime(a, b);
                }
                // if (compare($a, $b, date_order) == 0) {
                //     return compare($a, $b, date_order);
                // } else {
                //     return compareTime(a, b, date_order);
                // }
            };

            let flights = search_results.children('.flight');
            flights = flights.sort(compareDate);
            make_header();
            flights.detach().appendTo(search_results);
            date_order *= -1;
        };

        $('<th id = "airline_sort"></th>').html('<div>airline</div>').click(name_sort).appendTo(search_header);
        $('<th id = "date_sort"></th>').html('<div>date</div>').click(time_sort).appendTo(search_header);
        $('<th id = "departure_time_sort"></th>').html('<div>departure time</div>').click(time_sort).appendTo(search_header);
        $('<th id = "arrival_time_sort"></th>').html('<div>arrival time</div>').click(time_sort).appendTo(search_header);
        $('<th id = "departure_code_sort"></th>').html('<div>from</div>').appendTo(search_header);
        $('<th id = "arrival_code_sort"></th>').html('<div>to</div>').appendTo(search_header);
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
            show_flight(departure.latitude, departure.longitude, arrival.latitude, arrival.longitude, instance_node);
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
    $("body").empty().append('<div id="currentdisplay"></div>');

    construct_search();
}


let show_flight = (lat1, lon1, lat2, lon2, instance_node) => {
    lat1 = parseFloat(lat1);
    lon1 = parseFloat(lon1);
    lat2 = parseFloat(lat2);
    lon2 = parseFloat(lon2);
    let lat_center = (lat1 + lat2) / 2;
    let lon_center = (lon2 + lon2) / 2;


    $('#currentdisplay').empty().append('<div id="map"></div><button id = "purchase">purchase now</button>');

    $('#purchase').click(() => {
       buy_ticket(instance_node);
    });
    let initMap = () => {
        let map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: lat_center, lng: lon_center},
            zoom: 3,
            mapTypeId: 'terrain'
        });

        let lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            //path: 'M 0,-5 A  1,1 0 0 1 1,-4 L 1,-1 5,1 5,2 1,1 1,3 2,4 2,5 0,4  0,4 -2, 5 -2,4, -1,3 -1,1 -5,2 -5,1 -1,-1 -1,-4 0,-5',
            scale: 3,
            strokeColor: 'orange'
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
};

let buy_ticket = (instance_node) => {
    $('#currentdisplay').empty()
        .append('<div><p>first name</p><input type="text" id="firstinput" placeholder = "Johnny"></div>')
        .append('<div><p>last name</p><input type="text" id="lastinput" placeholder = "Appleseed"></div>')
        .append('<div><p>age</p><input type="text" id="ageinput" placeholder = "27"></div>')
        .append('<div><p>gender</p><input type="text" id="genderinput" placeholder = "male"></div>')
        .append('<div><p>email address</p><input type="text" id="emailinput" placeholder = "johnnyappleseed@gmail.com"></div>')
        .append('<div><button id = "submitbutton">purchase ticket</button>');

    function make_conformation_code() {
        let code = "";
        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 8; i++)
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    }

    $('#submitbutton').click(() => {
        let code = make_conformation_code()
        $.ajax(root_url + 'itineraries', {
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            data: {
                itinerary: {
                    "email": $('#emailinput').val(),
                    "confirmation_code": code
                }
            },
            error: (response) => {
                alert('Error: Bad Submission.');
            }
        }).then((response) => {
            $.ajax(root_url + 'tickets', {
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                data: {
                    ticket: {
                        "first_name": $('#firstinput').val(),
                        "last_name": $('#lastinput').val(),
                        "age": parseInt($('#ageinput').val()),
                        "gender": $('#genderinput').val(),
                        "is_purchased": true,
                        "instance_id": instance_node.data.id,
                        "itinerary_id": response.id
                    }
                },
                success: () => {
                    alert('Success: Ticket Purchased! Conformation code: ' + code);
                    construct_search();
                },
                error: (response) => {
                    alert('Error: Bad Submission.');
                }
            });
        });


    });


};
