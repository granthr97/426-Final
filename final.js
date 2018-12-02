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
	var tickets;
	get_all_info(tickets, 'tickets', true);
}

// e.g. get_all_info(array, 'tickets', true, 123);
var get_all_info = function(storage, name, retrieve_connected_info, id){
	let url = root_url + name;
	$.ajax(url, {
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			if (!retrieve_connected_info){
				storage = response;
			} else {
				storage = {};
				for(let i in response){
					let unit = storage[i];
					unit = [];
					unit[name] = response[i];
					// get_instance(unit, response[i].instance_id);
					// get_seat(unit, response[i].seat_id);
					// get_itinerary(unit, response[i].itinerary_id);
					for (let key in response[i]){
						if (key.endsWith('_id') && !key.startsWith('user')){
							let next = key.substring(0, key.length - 3);
							let id = response[i][key];
							get_specific_info(unit, next, id);
						}
					}
				}
			}
		}, error: () => {
			alert('bad');
		}
	});
}

var get_specific_info = function(unit, name, id){
	if (!id || unit[name]) { return; }
	let url = root_url;
	if (name == 'itinerary') { url += 'itineraries/' + id;
	} else if (name == 'departure' || name == 'arrival') {url += 'airports/' + id }
	else { url += name + 's/' + id; }
	$.ajax(url,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			unit[name] = response;
			for (let key in response){
				if (key.endsWith('_id') && !key.startsWith('user')){
					let next = key.substring(0, key.length - 3);
					let newid = response[key];
					get_specific_info(unit, next, newid);
				}
			}
			console.log(unit);
		}, error: () => {
			alert('bad');
		}
	});
}
