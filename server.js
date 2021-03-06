const chatServer = require('./chat-server');

const WebSocketServer = require("ws").Server
const PORT = process.env.PORT || 8000;

const express = require('express');
const app = express();


const server = require('http').createServer(app);


app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
	res.render('index.ejs');
});

server.listen(PORT);

const wss = new WebSocketServer({server});

let sockets = [];

wss.on('connection', function(socket) {
  sockets.push(socket);

  socket.on('message', function(msg) {
    console.log('chaussette bien reçue chef', msg)
    handleMessage(parseMsg(msg), this);
  });

  // When a socket closes, or disconnects, remove it from the array.
  socket.on('close', function() {
    console.log('socket closed');
    sockets = sockets.filter(s => s !== socket);
    handleMessage({type: TYPES.DISCONNECTING}, socket);
  });
});

const TYPES = {
  NEW_USER: 'newUser',
  SIGNAL_MESSAGE_FROM_CLIENT: 'signal_message_from_client',
  CLOSE_MESSAGE_FROM_CLIENT: 'close_message_from_client',
  CLOSE_MESSAGE_TO_CLIENT: 'close_message_to_client',
  FILE_MESSAGE_FROM_CLIENT: 'file_message_from_client',
  FILE_MESSAGE_TO_CLIENT: 'file_message_to_client',
  DISCONNECTING: 'disconnecting',
  JOINED_ROOM: 'joined_room',
  SIGNAL_MESSAGE_TO_CLIENT: 'signal_message_to_client'
}

const SIGNAL_TYPES = {
  USER_HERE: 'userHere'
}

function handleMessage({type, content}, socket) {
  switch (type) {
    case TYPES.NEW_USER:
      onNewUser(content, socket);
      break;
    case TYPES.SIGNAL_MESSAGE_FROM_CLIENT: 
      onSignal(content, socket);
      break;
    case TYPES.DISCONNECTING:
      onDisconnecting(socket);
      break;
    case TYPES.CLOSE_MESSAGE_FROM_CLIENT:
      closeChannel(socket);
      break;
    case TYPES.FILE_MESSAGE_FROM_CLIENT:
      sendFileToOther(content, socket);
    default:
      break;
  };
}

function onNewUser({sex, preference}, socket) {
    chatServer.connectUsers(sex, preference, socket);
    const signalingUiid = chatServer.generateSignalingIdForRoom(socket.room);
    
    const roomMsg = prepareMsg({type: TYPES.JOINED_ROOM, content: {room: socket.room}});
    broadcastToMe(roomMsg, socket);
    
    const signalingMsg = prepareMsg({type: TYPES.SIGNAL_MESSAGE_TO_CLIENT, content: {signalType: SIGNAL_TYPES.USER_HERE, message: signalingUiid}});
    broadcastToMe(signalingMsg, socket);
    
}

function onSignal({signalType, message}, socket) {
  const signalingMsg = prepareMsg({type: TYPES.SIGNAL_MESSAGE_TO_CLIENT, content: {signalType, message, room: socket.room}});
  console.log('signaling message to broadcast', signalingMsg);
  broadcastToRoomButMe(signalingMsg, socket);
}

function onDisconnecting(socket) {
  	console.log('disconnecting from socket');
		chatServer.disconnectUsers(socket.room);
}

function prepareMsg(msg) {
  return JSON.stringify(msg);
}

function parseMsg(msg) {
  return JSON.parse(msg);
}

function broadcastToMe(msg, socket) {
  socket.send(msg);
}

function broadcastToRoomButMe(msg, currSocket) {
  sockets.filter(socket => socket.room === currSocket.room && socket !== currSocket).forEach((socket, i) => {
    socket.send(msg)
  });
}

function closeChannel(socket) {
  console.log("brodacasting message for closing")
  broadcastToRoomButMe(prepareMsg({type: TYPES.CLOSE_MESSAGE_TO_CLIENT}), socket);
}

function sendFileToOther(contenu, socket) {
  console.log("sending profile pic to other (not displaying it)")
  broadcastToRoomButMe(prepareMsg({type: TYPES.FILE_MESSAGE_TO_CLIENT, content: contenu}), socket)
}
