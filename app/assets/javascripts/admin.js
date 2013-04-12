/* This file implements the admin panel. */
function displayAdmin(){
    jQuery.ajax({
        url: '/api/v1/admin/weights/get',
        type: 'GET',
        datatype: 'json',
        contentType: "charset=UTF-8",
        success: displaySliders
    });
}

function sendAdmin(){
    var params = [];
    var values = $('.admin-slider').each(function(i, e){
      params.push($(e).slider( 'value' ));
    });
    jQuery.ajax({
        url: '/api/v1/admin/weights/set?values=' + params,
        type: 'POST',
        success: displaySliders
    });
}

function displaySliders(response, status) {
    var providers = ["Manual", "MDC", "Range", "Thesaur", "StringMatcher"];
    var panel = $("#admin");

    panel.empty();
    panel.append('<input type="button" onclick="debugMindmap();" value="Debug Mindmap">');

    var values = response;
    $.each(providers, function(index, name) {
        panel.append($('<p/>').html(name).addClass('provider'));
        var slider = $('<p/>').addClass('admin-slider');
        slider.slider({animate:"fast", value:values[index]});
        panel.append(slider);
    });
    panel.append('<input type="button" onclick="sendAdmin();" value="Apply">');
    panel.append('<input type="button" style="float:right" onclick="resetAdmin();" value="Reset">');
    History.Adapter.trigger(window, 'statechange')
}

function resetAdmin(){
    jQuery.ajax({
        url: '/api/v1/admin/weights/reset',
        type: 'POST',
        success: displaySliders
    });
}

function debugMindmap() {
    $("#mindmap").debug();
}

