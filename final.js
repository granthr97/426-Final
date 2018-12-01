var root_url = "http://comp426.cs.unc.edu:3001/api/";

$(document).ready(() => {
    $('#login_btn').on('click', () => {
		let user = $('#login_user').val();
		let pass = $('#login_pass').val();
		
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
	});
});

var construct_page = function(){
	let body = $('body');

	body.empy();

	body.append('button class="weatherAPI" id="weatherAPI">Weather</button>');

	let formContainer = $('<div class = "formContainer"></div>');

	body.append(formContainer);
}