/* This file implements the admin panel. */
function displayAdmin(){
    var providers = ["Manual", "MDC", "Range", "Thesaur", "StringMatcher", "Bing"];
    var panel = $("#admin");
    panel.empty();
    $.each(providers, function(index, name) {
      panel.append($('<p/>').html(name).addClass('provider'));
      var slider = $('<p/>').addClass('admin-slider');
      slider.slider({animate:"fast"});
      panel.append(slider);
    });
    panel.append('<input type="button" onclick="sendAdmin();" value="Send">');
}

function sendAdmin(){
    var params = [];
    var values = $('.admin-slider').each(function(i, e){
      params.push($(e).slider( 'value' ));
    });
    jQuery.ajax({
        url: '/api/v1/admin/setWeight?values=' + params,
        type: 'POST'
    });
    mindmapper.sendRequest($("#code-name").val().toUpperCase(), $("#lang").val());
}