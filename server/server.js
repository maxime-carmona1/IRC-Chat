var express = require('express');
var app = express();
var http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});
var router = require('./router');
const mongoose = require('mongoose')

var userSchema = require('./db').userSchema;
var roomSchema = require('./db').roomSchema;

var User = mongoose.model('User', userSchema);
var Room = mongoose.model('Room', roomSchema);

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(router)


io.on('connection', (socket) => {
    var currentUser = '';
    
    socket.on('UserLogged', (username) => {
        var user = new User();
        user.name = username.username;
        user.password = "pppl";
        user.rooms = ['general'];
        user.save();
        currentUser = username.username;

        io.emit('getUsers')

        io.emit('getRooms')

        socket.broadcast.emit('userJoined', {
            username: username.username
        })

    });

    socket.on('disconnect', (user) => {
        if (currentUser != '') {

            socket.broadcast.emit('userLeft', {
                username: currentUser
            })
            User.deleteMany({ name: currentUser}).then(io.emit('getUsers'))
        }
    })

    socket.on('new-message', function (message) {
        Room.updateOne({ name: message.room}, {$addToSet : {messages: {message: message.messages.content, sender: currentUser}}}).then(
        io.emit('new-message-sent', {
            messages: message
        })
        )
        io.emit('getRooms')
    })

    socket.on('nickname', function (nick) {
        User.updateOne({ name: currentUser}, {name: nick.nick}).then(
            io.emit('getUsers')
        )
        currentUser = nick.nick
    })

    socket.on('createRoom', function (roomname) {
        var room = new Room();
        room.name = roomname.name;
        room.messages = {};
        room.save();

        io.emit('getRooms')
    })
});

http.listen(5000, function () {
    console.log('server listening on port 5000:');
});
