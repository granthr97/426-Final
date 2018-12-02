"use strict";

var root_url = "http://comp426.cs.unc.edu:3001/";
var tickets = [];

$(document).ready(() => {

	var log_in = function(user, pass){
		$.ajax(root_url + 'sessions', {
			type: 'POST',
			xhrFields: {withCredentials: true},
			data: {"user": {
				    "username": user,
				    "password": pass
				  }
			},
			success: (response) => {
				construct_page();
			}, error: () => {
				alert('bad login');
			}
		});		
	}

	// for testing convenience
	log_in('granthr', '730047576');

    $('#login_btn').on('click', () => {
		let user = $('#login_user').val();
		let pass = $('#login_pass').val();
		log_in(user, pass);
	});


});

var construct_page = function(){
	let body = $('body');
	body.empty();
	var tickets = {};
	get_info(tickets, 'ticket', 'tickets', true);
}

// e.g. get_info('itinerary', 'itineraries', false);
var get_info = function(storage, singular, plural, retrieve_connected_info){
	$.ajax(root_url + plural, {
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			if (!retrieve_connected_info){
				storage = response;
			} else {
				for(let i in response){
					let unit = {
						"ticket": null,
						"instance": null,
						"flight": null,
						"departure_airport": null,
						"arrival_airport": null,
						"itinerary": null,
						"seat": null,
						"plane": null,
						"airline": null,
					}
					storage[i] = unit;
					unit[singular] = response[i];
					get_instance(unit, response[i].instance_id);
					get_seat(unit, response[i].seat_id);
					get_itinerary(unit, response[i].itinerary_id);
				}
			}
			console.log(storage);
		}, error: () => {
			alert('bad');
		}
	});
}

var get_ticket = function(unit, id){
	if (!id || unit.ticket) { return; }
	$.ajax(root_url + 'tickets/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			unit.ticket = response;
			get_itinerary(unit, response.itinerary_id);
			get_instance(unit, response.instance_id);
			get_seat(unit, response.seat_id);
		}, error: () => {
			alert('bad');
		}
	});
}

var get_airline = function(unit, id){
	if (!id || unit.airline) { return; }
	$.ajax(root_url + 'airlines/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			unit["airline"] = response;
		}, error: () => {
			alert('bad');
		}
	});
}

var get_plane = function(unit, id){
	if (!id || unit.plane) { return; }
	$.ajax(root_url + 'planes/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			unit["plane"] = response;
			get_airline(unit, response.airline_id);
		}, error: () => {
			alert('bad');
		}
	});
}

var get_seat = function(unit, id){
	if (!id || unit.seat) { return; }
	$.ajax(root_url + 'seats/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			unit["seat"] = response;
			get_plane(unit, response.plane_id);
		}, error: () => {
			alert('bad');
		}
	});
}

var get_itinerary = function(unit, id){
	if (!id || unit.itinerary) { return; }
	$.ajax(root_url + 'itineraries/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			unit["itinerary"] = response;
		}, error: () => {
			alert('bad');
		}
	});
}

var get_instance = function(unit, id){
	if (!id || unit.instance) { return; }
	$.ajax(root_url + 'instances/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			unit["instance"] = response;
			get_flight(unit, response.flight_id);
		}, error: () => {
			alert('bad');
		}
	});
}

var get_flight = function(unit, id){
	if (!id || unit.flight) { return; }
	$.ajax(root_url + 'flights/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			unit["flight"] = response;
			get_departure_airport(unit, response.departure_id);
			get_arrival_airport(unit, response.arrival_id);
			get_plane(unit, response.plane_id);
			get_airline(unit, response.airline_id);
		}, error: () => {
			alert('bad');
		}
	});
}

var get_departure_airport = function(unit, id){
	if (!id || unit.departure_airport) { return; }
	$.ajax(root_url + 'airports/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			unit["departure_airport"] = response;
		}, error: () => {
			alert('bad');
		}
	});
}

var get_arrival_airport = function(unit, id){
	if (!id || unit.arrival_airport) { return; }
	$.ajax(root_url + 'airports/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			unit["arrival_airport"] = response;
		}, error: () => {
			alert('bad');
		}
	});
}
