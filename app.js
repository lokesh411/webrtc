const express = require('express')
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v1: uuidv1 } = require('uuid')

app.set('view engine', 'ejs');

app.use(express.static('public'))

app.get('/', (req, res) => {
    const roomId = uuidv1();
    res.redirect(`/${roomId}`)
})

app.get('/:roomId', (req, res) => {
    res.render('room', { roomId: req.params.roomId })
})

io.on('connection', (socket) => {
    console.log('socket connection is up ::: ');
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId);
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', roomId ,userId);
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

const PORT = process.env.PORT

server.listen(PORT, () => console.log('Running in 4k + ' + PORT));
