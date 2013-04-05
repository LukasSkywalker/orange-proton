function displayAdmin(){
    var providers = ["Manual", "MDC", "Range", "Thesaur", "StringMatcher", "Bing"];
    var panel = $("#admin");
    panel.innerHTML = "";
    for (var j = 0;j<6;j++)
    {
      panel.append('<p class="provider">' + providers[j] + '</p>');
      panel.append('<p id="slider'+ (j+1)+'"></p>');
      $("#slider" + (j+1)).slider({disabled:false},{max: 100}, {min:0});
    }
    panel.append('<input type="button" onclick="sendAdmin();" value="Send">');
}

function sendAdmin(){
    var params = "[";
    for (var i = 1; i<=6; i++)
    {
        var val = $("#slider" + i).slider("value");
        console.log(val);
        params += val;
        if (i<6)
            params += ",";
    }
    params += "]";
    jQuery.ajax({
        url: '/api/v1/admin/set?values=' + params,
        type: 'POST'
    });

    mindmapper.sendRequest($("#code-name").val().toUpperCase(), $("#lang").val());
}