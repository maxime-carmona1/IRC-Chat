const mongoose = require('mongoose')
require('dotenv').config();

const url = `${process.env.MONGODBCONNECTION}`;

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.set('strictQuery', false);
mongoose.connect(url, connectionParams)
    .then(() => {
        console.log('Connected to the database ')
    })
    .catch((err) => {
        console.error(`Error connecting to the database. n${err}`);
    })


var userSchema = mongoose.Schema({
    name: String,
    password: String,
    rooms: Array
}, {
    toObject: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    },
    toJson: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    }
});

var roomSchema = mongoose.Schema({
    name: String,
    messages: Array
}, {
    toObject: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    },
    toJson: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    }
});


var User = mongoose.model('User', userSchema);
var Room = mongoose.model('Room', roomSchema);


module.exports.db = { User, Room }