var root_url = "http://comp426.cs.unc.edu:3001/api/";

$(document).ready(() => {
    $('#login_btn').on('click', () => {
		let user = $('#login_user').val();
		let pass = $('#login_pass').val();

		console.log(user);
		console.log(pass);
		
		$.ajax(root_url + 'sessions', {
			type: 'POST',
			xhrFields: {withCredentials: true},
			data: {"user": {
				    "username": user,
				    "password": pass
				  }
			},
			success: (response) => {
				alert('good');
			}, error: () => {
				alert('error');
			}
		});
	});
});