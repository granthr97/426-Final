var root_url = "http://comp426.cs.unc.edu:3001/";

$(document).ready(() => {
    $('#login_btn').on('click', () => {
	
	let user = $('#login_user').val();
	let pass = $('#login_pass').val();

	console.log(user);
	console.log(pass);
	
	$.ajax(root_url + 'login',
	       {
		   type: 'GET',
		   xhrFields: {withCredentials: true},
		   data: {
		       username: user,
		       password: pass
		   },
		   success: (response) => {
		       if (response.status) {
			   buildalert();
		       } else {
			   $('#mesg_div').html("Login failed. Try again.");
		       }
		   },
		   error: () => {
		       alert('error');
		   }
	       });
    });
});
//hello

function buildalert(){
	alert("hello");
}