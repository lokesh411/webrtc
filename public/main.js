const socket = io('/');
const videoGrid = document.getElementById('video-grid');
// const peer = new Peer(undefined, {
//     host: '/',
//     port: 4001
// });
// using the main peer
const peer = new Peer()

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    console.log('the current stream ::: ', stream);
    addVideoStream(myVideo, stream);
    const video = document.createElement('video')
    peer.on('call', (call) => {
        console.log('call event has occurred :::: ', call)
        peers[call.peer] = call;
        call.answer(stream)
        call.on('stream', (userVideoStream) => {
            console.log('call answered ::: ', userVideoStream)
            addVideoStream(video, userVideoStream)
        })
    })
    socket.on('user-connected', (roomId, userId) => {
        console.log('new user has connected the room ::: ', roomId, userId);
        connectToNewUser(userId, stream);
    })
})

peer.on('open', (id) => {
    console.log('socket emitted :: userid ::: ', id)
    socket.emit('join-room', roomId, id);
})

socket.on('user-disconnected', userId => {
    console.log('user disconnected ::: ', userId, peers[userId])
    if(peers[userId]) {
        peers[userId].close()
        delete peers[userId];
    }
})

const addVideoStream = (video, stream) => {
    document.getElementById('people-number').innerText = `${Object.keys(peers).length + 1} in the room`
    if(!stream) {
        return;
    }
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    video.classList.add("video-grid");
    videoGrid.append(video)
    console.log('video is getting appended')
}

const connectToNewUser = (userId, stream) => {
    console.log('in connect to new user')
    const streamToBeSent = peer.call(userId, stream);
    const video = document.createElement('video');
    peers[userId] = streamToBeSent;
    streamToBeSent.on('stream', (peerVideoStream) => {
        console.log('stream event is getting fired')
        addVideoStream(video, peerVideoStream);
    })
    streamToBeSent.on('close', () => {
        console.log('close event occurrend on the stream :: ')
        video.remove()
    })
}