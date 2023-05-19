import React, { Component } from 'react';
import Button from './components/Button';
import socketIO from 'socket.io-client';
const socket = socketIO.connect('http://localhost:5000');

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentRoom: 'general',
            username: 'tmp',
            usertmp: '',
            tmp: '',
            tempMessage: '',
            rooms: [],
            messages: [],
            users: []
        }
        this.onChange = this.onChange.bind(this);
        this.handlePseudo = this.handlePseudo.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleForm = this.handleForm.bind(this);
    }

    componentDidMount() {

        //User Connection
        socket.on('userJoined', (user) => {
            this.setState({
                messages: this.state.messages.concat({
                    channel: this.state.currentRoom,
                    author: 'server',
                    content: user.username + ' joined the channel',
                    to: ''
                })
            })
        });

        //User Disconnection
        socket.on('userLeft', (user) => {
            this.setState({
                messages: this.state.messages.concat({
                    room: this.state.currentRoom,
                    sender: 'server',
                    content: user.username + ' left the channel',
                    to: ''
                })
            })
        });

        //User listing
        socket.on('getUsers', (userList) => {
            fetch('http://localhost:5000/users', { method: 'GET' }).then(res => res.json()).then(res => {
                this.setState({ users: res })
            })
        })

        //Rooms listing
        socket.on('getRooms', (roomsList) => {
            fetch('http://localhost:5000/rooms', { method: 'GET' }).then(res => res.json()).then(res => {
                this.setState({ rooms: res })
            })
        })


        //Message handling
        socket.on('new-message-sent', (message) => {
            this.setState({
                messages: this.state.messages.concat({
                    room: message.messages.messages.room,
                    sender: message.messages.messages.sender,
                    content: message.messages.messages.content,
                    to: message.messages.messages.to
                })
            })
        })
    }

    //Join Room
    Join(room) {
        this.setState({ currentRoom: room })
    }

    Nick(name) {
        socket.emit('nickname', { nick: name })
        this.setState({ username: name })
    }

    Create(room) {
        socket.emit('createRoom', { name: room })
        this.setState({ currentRoom: room })
    }

    //input change handler
    handleChange(event) {
        this.setState({ tmp: event.target.value });

        this.setState({
            currentMsg: {
                room: this.state.currentRoom,
                sender: this.state.username,
                content: event.target.value,
                to: ''
            }
        })
    }

    //form event handler
    handleForm(event) {
        event.preventDefault();

        var typedData = this.state.tmp.split(' ');

        switch (typedData[0]) {
            case '/create':
                if (typedData[1] !== undefined && typedData[1] !== '') {
                    this.Create(typedData[1]);
                }
                this.setState({ tmp: '' });
                return false;
            case '/join':
                if (typedData[1] !== undefined && typedData[1] !== '') {
                    this.Join(typedData[1]);
                }
                this.setState({ tmp: '' });
                return false;
            case '/quit':
                if (typedData[1] !== undefined && typedData[1] !== '') {
                    this.Join('general');
                }
                this.setState({ tmp: '' });
                return false;
            case '/nick':
                if (typedData[1] !== undefined && typedData[1] !== '') {
                    this.Nick(typedData[1]);
                }
                this.setState({ tmp: '' });
                return true;
            default:
                socket.emit('new-message', { messages: this.state.currentMsg, room: this.state.currentRoom });
                this.setState({ tmp: '' });
        }
    }

    onChange(event) {
        this.setState({ usertmp: event.target.value })
    }

    handlePseudo(event) {
        event.preventDefault();
        socket.emit('UserLogged', { username: this.state.usertmp })
        this.setState({ username: this.state.usertmp })
    }

    renderUsers() {
        return this.state.users.map(user => {
            return <span className="users"> {user['name']} - </span>
        });
    }

    renderMessages() {
        return this.state.messages.map(message => {
            return <span className="messages"> {message['content']}<br></br></span>
        });
    }

    renderRooms() {
        return this.state.rooms.map(room => {
            return <span className="rooms"> {room['name']} - </span>
        });
    }

    render() {
        if (this.state.username === 'tmp') {

            return (
                <div className="flex justify-center text-center p-8">
                    <div className="username">
                        <h1>Welcome to IRC login</h1>
                        <div className="p-8">
                            <span className="label">
                                Enter your pseudo :
                            </span>
                        </div> 
                            <form>
                            <input className='text-sm sm:text-base text-center relative w-full border rounded placeholder-gray-400 focus:border-indigo-400 focus:outline-none py-2 pr-2' type="text" onChange={this.onChange} />
                                <button onClick={this.handlePseudo}>Login</button>
                            </form>
                    </div>
                </div>
            )
        }
        if (this.state.username !== '') {
            return (
                <div className="App">
                    <div className="flex justify-center py-8">
                        <div className="max-w-sm bg-white border-2 border-gray-300 p-6 rounded-md tracking-wide shadow-lg">
                            <div className="rounded text-center relative -mb-px block border  border-grey px-4">
                                rooms <br />
                                {this.renderRooms()}
                            </div>
                            <div className="text-center">
                                <em>Welcome {this.state.username} to the {this.state.currentRoom} room</em>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center rounded-lg  p-16">
                        <div className="grid place-items-center w-4/5 mx-auto p-10 my-20 sm:my-auto bg-gray-50 border rounded-xl shadow-2xl space-y-5 text-center">
                            <div>
                                <div id="content">
                                    <br />
                                    {this.renderMessages()}
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="flex justify-center">
                        <span className="border rounded-lg">
                            <div className="sendForm">
                                <form >
                                    <input className="" id="msg" value={this.state.tmp} onChange={this.handleChange} />
                                    <button onClick={this.handleForm}>Send</button>
                                </form>
                            </div>
                        </span>
                    </div>
                    <div className="bg-gray-200">
                        <footer className="flex flex-wrap items-center justify-between p-3 m-auto">
                            <div className="members">
                                Current Users in the room:
                                {this.renderUsers()}
                            </div>
                        </footer>
                    </div>
                </div>
            )
        }
        return (<p> {this.state.username} joined the room</p>);
    }
}

export default App;
