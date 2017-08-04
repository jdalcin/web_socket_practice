const app = require('express')();
const http = require('http').Server(app);
var io = require('socket.io')(http);
var createCanvas = require('canvas');

// server global variables
var numShapes = 0;
var users = 0;
var circles = [];

// draw circle in canvas
function drawCircle(radius, canvas, color, userID) {
  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  var context = canvas.getContext('2d');

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
  context.fillStyle = "black"; // font color to write the text with
  var font = "bold " + radius  +"px serif";
  context.font = font;
  context.textBaseline = 'middle';
  context.fillText('' + userID + '', radius, radius);
  console.log("Canvas Updated.");
}

// sets up html and confirms web socket connections
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('sendShapes', circles);
  console.log('Shapes sent.');
  socket.on('mouseDown', function(data) {
    console.log("Mouse held down has reached server.");
    var canvas = null;
    var x = 0;
    var y = 0;
    if (data.clientUserID === null) {
        users++;
    }
    data.clientUserID = data.clientUserID || users;
    if (data.clientShapeID === 0) {
      numShapes++;
      console.log("Number of shapes updated to: " + numShapes);
      data.clientShapeID = numShapes;
      canvas = new createCanvas(50, 50);
      data.clientShapeRadius = canvas.width / 3;
       x = data.clientShapeXPos;
       y = data.clientShapeYPos;
    } else {
      canvas = new createCanvas(data.clientShapeRadius * 2 + 2, data.clientShapeRadius * 2 + 2);
      data.clientShapeRadius = data.clientShapeRadius + 1;
      x = data.clientShapeXPos;
      y = data.clientShapeYPos;
    }
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    data.clientShapeColor = data.clientShapeColor || 'rgb(' + r + ',' + g + ',' + b + ')';
    drawCircle(data.clientShapeRadius, canvas, data.clientShapeColor, data.clientUserID);
    console.log('Color sent to client: ' + data.clientShapeColor);
    io.emit('mouseDown', {
      serverShapeURL: canvas.toDataURL(),
      serverShapeID: data.clientShapeID,
      serverShapeRadius: data.clientShapeRadius,
      serverXPos: x,
      serverYPos: y,
      serverShapeColor: data.clientShapeColor,
      serverUserID: data.clientUserID
    });
    console.log("Server sent data to client with mouse pushed down.");
  });
  socket.on('updateCirclesArray', function(data) {
     var circle = {
        URL: data.clientShapeURL,
        x: data.clientShapeXPos,
        y: data.clientShapeYPos,
        ID: data.clientShapeID
     };
     circles.push(circle);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});