function displayAdmin(){
    for (var i = 1; i<=6; i++)
    {
        $("#slider" + i).slider({disabled:false},{max: 100}, {min:0});
    }
}

function sendAdmin(){
    var params = "[";
    for (var i = 1; i<=6; i++)
    {
        var val = $("#slider" + i).slider("value");
        console.log(val);
        params += val;
    }
    params += "]";
    jQuery.ajax({
        url: '/api/v1/admin/set?values=' + params,
        type: 'POST'
    });
}