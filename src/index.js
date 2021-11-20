const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

/*
server(emit) -> client (recive) - countUpdated
client(emit) -> server(recive) - increment
*/

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
console.log('New WebSocket connection')//printing when new connection is aquired

 socket.on('join',(options, callback)=>{
 const {error,user} =addUser({ id :socket.id , ...options})
     
 if(error){
 return callback(error)
     }

     socket.join(user.room)
       
     socket.emit('message',generateMessage('Bot','Welcome to the chat room'))
     socket.broadcast.to(user.room).emit('message', generateMessage('Bot',`${user.username} hooped in the room`)) //for everyone except you 
       io.to(user.room).emit('roomData',{
           room : user.room,
           users : getUsersInRoom(user.room)
       })

     callback()

        // io.to.emit - emits to everyone in room 
        //sockey.breoadcast.to.emit -except you , to everyone 
    })

    socket.on('sendMessage', (message,callback) => {
       const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(message)){
        return callback("Profanity is not allowed")
        }

        io.to(user.room).emit('message',generateMessage(user.username,message))//prints message to all the users 
        callback()
    })

    socket.on('sendLocation', (coords,callback) => {
      const user= getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
       const user = removeUser(socket.id)

       if(user){
        io.to(user.room).emit('message', generateMessage('Bot',`${user.username} has left`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
             
    }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})