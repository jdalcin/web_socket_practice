const app = require('express')();
const http = require('http').Server(app);
var io = require('socket.io')(http);
var createCanvas = require('canvas');

var canvas = new createCanvas(50, 50);
var context = canvas.getContext('2d');
var number = 0;

// draw circle in canvas
function drawCircle() {
	var centerX = canvas.width / 2;
	var centerY = canvas.height / 2;
	var radius = canvas.width / 3;


	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = 'blue';
	context.fill();
	console.log("Canvas Updated.");
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  // socket.on('chat message', function(msg){
  //   console.log('message: ' + msg);
  //   io.emit('chat message', msg);
  // });
  socket.on('clientClick', function(data) {
  	console.log("Click reached server.")
  	drawCircle();
  	number++;
  	var x = Math.random() * data.screenWidth;
          	var y = Math.random() * data.screenHeight;
  	io.emit('clientClick', {URL: canvas.toDataURL(), numShapes: number, x: x, y: y});
  	console.log("Server sent click data.");
  	console.log("Number of images is: " + number);
  })
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});