console.log('Loaded!');
var img = document.getElementById("image");
var distance = 0;
function moveRight() {
    distance = distance + 1;
    img.style.marginLeft = distance + 'px';
}

img.onclick = function() {
    var interval = setInterval(moveRight,20);
}
