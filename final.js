"use strict";

let root_url = "http://comp426.cs.unc.edu:3001/";

$(function() {
   $('#login_btn').on('click', () => {
        $.ajax(root_url + 'sessions', {
            type: 'POST',
            data: {
                user: {
                    username: $('#login_user').val(),
                    password: $('#login_pass').val()
                }
            }
        }).then(after_login);
    });
});

let after_login = () => {
    get_seat_map(1729168);
}

let get_seat_map = (instance_id) => {
    $.ajax(root_url + 'instances/' + instance_id, {
        type: 'GET',
        xhrFields: { withCredentials: true} ,
    }).then((response) => {
        return $.ajax(root_url + 'flights/' + response.flight_id, {
            type: 'GET',
            xhrFields: { withCredentials: true },
        });
    }).then((response) => {
        return $.ajax(root_url + 'seats', {
            type: 'GET',
            xhrFields: { withCredentials: true },
            data: {
                'filter[plane_id]' : response.plane_id
            }
        });
    }).then((response) => {
        response.sort((a, b) => {
            return (a.row != b.row)? a.row - b.row : a.number.localeCompare(b.number);
        });
        console.log(response);
    });
}
