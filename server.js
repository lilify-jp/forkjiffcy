const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('ユーザーが接続しました');
  
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('ユーザーが切断しました');
  });
});

server.listen(3000, () => {
  console.log('サーバーがポート3000で起動しました');
});