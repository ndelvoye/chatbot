'use strict';

const express = require('express');
var RiveScript = require("rivescript");

const PORT = process.env.PORT || 3000;
const Server = '/index.html';

const app = express();
app.disable("x-powered-by")
app.use(express.static('public'))
app.use('/css', express.static(__dirname + '/css'))
app.use((req, res) => res.sendFile(Server, { root: __dirname }))
const server = app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
});

// Init RiveScript
const bot = new RiveScript();
bot.loadDirectory("brain").then(loading_done).catch(loading_error);

// InitSocketIo
const io = require('socket.io')(server);

// Gestion des clients Socket.IO
io.on('connection', (socket) => {
    let client_name = "Client #" + socket.id + " (IP = " + socket.request.connection.remoteAddress + ")"
    socket.emit('msg', 'Hello ' + client_name + ' ! Feel free to ask me questions. Type "help" if you need some of it !')
    console.log(client_name + ' connected');
    socket.on('ask', (msg) => {
        console.log(client_name + ' asked : ' + msg)
        bot.reply("default", msg).then(function(reply) {
            console.log('Answered back to ' + client_name + ': ' + reply)
            socket.emit('msg', reply)
        });
    })
    socket.on('disconnect', () => console.log(client_name + ' disconnected'));
});

// Gestion de la date
setInterval( () => io.emit('time', new Date().toTimeString()), 1000)

// Fonctions
function loading_done() {
    console.log("Bot has finished loading!");
    bot.sortReplies();
}

function loading_error(error, filename, lineno) {
    console.log("Error when loading files: " + error);
}

