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
	get_all_info(tickets, 'flights', true);
}

// get all tickets, all flights, etc.
// e.g. get_all_info(array, 'tickets', true, 123);
var get_all_info = function(storage, name, retrieve_connected_info){
	let url = root_url + name;
	$.ajax(url, {
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			if (!retrieve_connected_info){
				storage = response;
				console.log(storage);
			} else {
				storage = [];
				for(let i in response){
					let unit = [];
					unit[name] = response[i];
					for (let key in response[i]){
						if (key.endsWith('_id') && !key.startsWith('user')){
							let next = key.substring(0, key.length - 3);
							let id = response[i][key];
							get_specific_info(unit, next, true, id, storage);
						}
					}
					storage[i] = unit;
				}
			}
			console.log(storage);
		}, error: () => {
			alert('bad');
		}
	});
}

var get_specific_info = function(unit, name, retrieve_connected_info, id, storage){
	if (!id || unit[name]) { return; }
	let url = root_url;
	if (name == 'itinerary') { url += 'itineraries/' + id;
	} else if (name == 'departure' || name == 'arrival') {url += 'airports/' + id }
	else { url += name + 's/' + id; }
	$.ajax(url,{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (response) => {
			if (!retrieve_connected_info){
				unit = response;
			} else {
				unit[name] = response;
				for (let key in response){
					if (key.endsWith('_id') && !key.startsWith('user')){
						let next = key.substring(0, key.length - 3);
						let newid = response[key];
						get_specific_info(unit, next, true, newid);
					}
				}
			}
		}, error: () => {
			alert('bad');
		}
	});
}
