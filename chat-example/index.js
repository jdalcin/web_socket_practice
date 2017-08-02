const app = require('express')();
const http = require('http').Server(app);
var io = require('socket.io')(http);
var createCanvas = require('canvas');

// server global variables
  var numShapes = 0;

// draw circle in canvas
function drawCircle(radius, canvas) {
  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  var context = canvas.getContext('2d');

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = 'blue';
  context.fill();
  console.log("Canvas Updated.");
}

// sets up html and confirms web socket connections
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('mouseDown', function(data) {
    console.log("Mouse held down has reached server.");
    var canvas = null;
    var x = 0;
    var y = 0;
    if (data.clientShapeID === 0) {
      numShapes++;
      console.log("Number of shapes updated to: " + numShapes);
      data.clientShapeID = numShapes;
      canvas = new createCanvas(50, 50);
      data.clientShapeRadius = canvas.width / 3;
       x = Math.random() * data.screenWidth;
       y = Math.random() * data.screenHeight;
    } else {
      canvas = new createCanvas(data.clientShapeRadius * 2 + 2, data.clientShapeRadius * 2 + 2);
      data.clientShapeRadius = data.clientShapeRadius + 1;
      x = data.clientShapeXPos;
      y = data.clientShapeYPos;
    }
    drawCircle(data.clientShapeRadius, canvas);
    console.log(data.clientShapeRadius);
    io.emit('mouseDown', {
      serverShapeURL: canvas.toDataURL(),
      serverShapeID: data.clientShapeID,
      serverShapeRadius: data.clientShapeRadius,
      serverXPos: x,
      serverYPos: y
    });
    console.log("Server sent data to client with mouse pushed down.");
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});