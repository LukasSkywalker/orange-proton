//This Script sends ajax json requests to the database
function sendRequest(){
    //TODO Count und lang aus UI ablesen?
    var input = document.getElementById("code");
    input.ajax()({
        url: '/api/v1/fields/get?code=B53&count=1&lang=de',
        type: 'GET',
        dataType: 'json',
        success: function() {

            alert('success!'); },
        error: function() { alert('fail!'); }
    });

}
