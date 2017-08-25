console.log('Loaded!');

var submit = document.getElementById("submit_butn");
submit.onclick = function() {
   
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
             alert('logged in successfully');   
            }else if(request.status === 403) {
                alert('log was un sucessfull');
            }else if(request.status === 500) {
                alert('Something went wrong at server side');
            }
        }
    };
     
    var username = document.getElementById("username");
    var password = document.getElementById("password");
    
    request.open('POST', 'http://nishantbitsmesra.imad.hasura-app.io/login', true);
    request.send(JSON.Stringify({username: username, password: password}));
};