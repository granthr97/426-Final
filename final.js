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
	get_tickets_info();
	console.log(tickets);
}

var get_tickets_info = function(){
	$.ajax(root_url + 'tickets', {
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			for(let i in response){
				tickets[i] = {
					"ticket": response[i],
					"instance": null,
					"flight": null,
					"departure_airport": null,
					"arrival_airport": null,
					"itinerary": null,
					"seat": null,
					"plane": null,
					"airline": null,
				}
				get_instance(tickets[i]);
				get_seat(tickets[i]);
				get_itinerary(tickets[i]);
			}
		}, error: () => {
			alert('bad');
		}
	});
}

var get_plane = function(ticket){
	let id = ticket['seat'].plane_id;
	if (!id) { return; }
	$.ajax(root_url + 'planes/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			ticket["plane"] = response;
			get_airline(ticket);
		}, error: () => {
			alert('bad');
		}
	});
}

var get_seat = function(ticket){
	let id = ticket['ticket'].seat_id;
	if (!id) { return; }
	$.ajax(root_url + 'seats/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			ticket["seat"] = response;
			console.log(ticket);
		}, error: () => {
			alert('bad');
		}
	});
}

var get_itinerary = function(ticket){
	let id = ticket['ticket'].itinerary_id;
	if (!id) { return; }
	$.ajax(root_url + 'itineraries/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			ticket["itinerary"] = response;
		}, error: () => {
			alert('bad');
		}
	});
}

var get_instance = function(ticket){
	let id = ticket['ticket'].instance_id;
	if (!id) { return; }
	$.ajax(root_url + 'instances/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			ticket["instance"] = response;
			get_flight(ticket);
		}, error: () => {
			alert('bad');
		}
	});
}

var get_flight = function(ticket){
	let id = ticket['instance'].flight_id;
	if (!id) { return; }
	$.ajax(root_url + 'flights/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			ticket["flight"] = response;
			get_departure_airport(ticket);
			get_arrival_airport(ticket);
		}, error: () => {
			alert('bad');
		}
	});
}

var get_departure_airport = function(ticket){
	let id = ticket['flight'].departure_id;
	if (!id) { return; }
	$.ajax(root_url + 'airports/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			ticket["departure_airport"] = response;
		}, error: () => {
			alert('bad');
		}
	});
}

var get_arrival_airport = function(ticket){
	let id = ticket['flight'].arrival_id;
	if (!id) { return; }
	$.ajax(root_url + 'airports/' + id,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			ticket["arrival_airport"] = response;
		}, error: () => {
			alert('bad');
		}
	});
}
