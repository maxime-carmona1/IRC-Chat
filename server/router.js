var express = require('express');
const mongoose = require('mongoose')

var userSchema = require('./db').userSchema;
var roomSchema = require('./db').roomSchema;

var User = mongoose.model('User', userSchema);
var Room = mongoose.model('Room', roomSchema);

var myRouter = express.Router();

myRouter.route('/')
    .all(function (req, res) {
        res.json({ message: "IRC API ", method: req.method });
    });

myRouter.route('/users')
    .get(function (req, res) {
        User.find(function (err, Users) {
            if (err) {
                res.send(err);
            }
            res.json(Users);
        });
    })
    .post(function (req, res) {
        var user = new User();
        user.name = req.body.name;
        user.password = req.body.password;
        user.rooms = req.body.rooms;
        user.save(function (err) {
            if (err) {
                res.send(err);
            }
            res.json({ message: 'User Created' });
        });
    });

myRouter.route('/rooms')
    .get(function (req, res) {
        Room.find(function (err, rooms) {
            if (err) {
                res.send(err);
            }
            res.json(rooms);
        });
    })
    .post(function (req, res) {
        var user = new Room();
        user.name = req.body.name;
        user.messages = req.body.messages;
        user.save(function (err) {
            if (err) {
                res.send(err);
                router     }
            res.json({ message: 'Room Created' });
        });
    });


module.exports = myRouter