var root_url = "http://comp426.cs.unc.edu:3001/";

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
	body.empty();

	body.append('<button class="weatherAPI" id="weatherAPI">Weather</button>');

	let formContainer = $('<div class = "formContainer"></div>');

	body.append(formContainer);
	body.append('<form id="rendered-form"><div class="rendered-form"><div class="fb-text form-group field-text-1543700248535"><label for="text-1543700248535" class="fb-text-label">Text Field</label><input type="text" class="form-control" name="text-1543700248535" id="text-1543700248535"></div><div class="fb-button form-group field-button-1543700258344"><button type="button" name="button-1543700258344" id="button-1543700258344">Button</button></div><div class="fb-text form-group field-text-1543700261387"><label for="text-1543700261387" class="fb-text-label">Text Field</label><input type="text" class="form-control" name="text-1543700261387" id="text-1543700261387"></div></div></form>')

}
