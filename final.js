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
*   UPON LOAD OF PAGE:
*   Send a simple, invalid POST request (with no data).
*   If the error response is 400 (logged in) then we continue;
*   Otherwise, we display the login page.
*/
$(() => {
    $.ajax(root_url + '/airports',{
        type: 'GET',
        xhrFields: {withCredentials: true},
        success: () => {
            after_login();
        },
        error: () => {
            display_login_page();
        }
    });
});


let display_login_page = () => {
    let body = $('body').empty();
    let login_div = $('<div id="login_div"><h1>Book a Flight</h1></div>');
    $('<p>Username: </p><input type="text" id="login_user"><br>').appendTo(login_div);
    $('<p>Password: </p><input type="text" id="login_pass"><br>').appendTo(login_div);
    let button = $('<button id="login_btn">Login</button>').appendTo(login_div);
    $('<div id="msg_div"></div>').appendTo(login_div);
    button.on('click', log_in);
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
    $('<button id="login_btn">Search</button>').appendTo(search_parameters).on('click', perform_search);
    let search_display = $('<div id = "search_display"></div>').appendTo(search);
    search_display.append('<h1>Results:</h1><br>');
    search_display.append('<div id = "search_results"></div>');


}


/*
*  Design a tree structure for holding information:
*  e.g. (root) -> from-airports list -> to-airports list -> flight lists-> instances
*  
*  Used, for instance, to store and display information concerning queried flights 
*  (including date, departure/arrival time, departure/arrival airport
*/
let Node = (data, parent) => {
    this.data = data;
    this.addParent(parent);
    this.children = [];
    this.depth = 0;
}

Node.prototype.addParent = (parent) => {
    if (!parent) {
        this.level = 0;
        return;
    }
    this.parent = parent;
    this.level = parent.level + 1;
}

Node.prototype.addChild = (data) => {
    let child = new Node(data, this);

    if (this['children'].length === 0){
        this.depth = 1;
        if (parent) {
            this.parent.alertDepth(1);
        }
    }
    this.children.push(child);
}

Node.prototype.alertDepth = (depth) => {
    if ((depth + 1) > this.depth) {
        this.depth = depth + 1;
        if(this.parent){
            this.parent.alertDepth(depth + 1);
        }
    }
}

let perform_search = () => {
    let from_city = $('#from_city').val();
    let to_city = $('#to_city').val();
    let min_date = $('#min_date').val();
    let max_date = $('#max_date').val();
    let min_time = $('#min_time').val();
    let max_time = $('#max_time').val();

    let resultRoot = new Node('');

    let departure_airports = get_filtered("airports", {
        'city': from_city
    });

    let arrival_airports = get_filtered("airports", {
        'city': to_city
    });

    let flights = Promise.all([departure_airports, arrival_airports]).then((responses) => {
        departure_airports = responses[0];
        arrival_airports = responses[1];

        let flight_responses = [];
        $(departure_airports).each((i, departure_airport) => {
            $(arrival_airports).each((j, arrival_airport) => {
               get_filtered("flights", {
                    'departure_id': departure_airport.id,
                    'arrival_id': arrival_airport.id,
                }).then((response) => {
                   flight_responses.push(response);
               });
            });
        });
        return flight_responses;
    });

    flights.then((response) => {
        console.log(response);
    });

}

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
}
