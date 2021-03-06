const users = []

//add user, remove user, get user, get userin room

const addUser = ({id, username, room }) => {
//clean the data 
username= username.trim().toLowerCase()
room = room.trim().toLowerCase()

//validate the data 

if(!username || !room){
    return {
        error :"Username and room are required"
    }
}

const existingUser = users.find((user) =>{
    return user.room === room && user.username ===username
})

if(existingUser){
    return{
        error:'Username already taken'
    }
}
const user= {id,username,room}
users.push(user)
return{user}
}

const removeUser = (id) =>{
const index = users.findIndex((user)=> user.id === id)


if(index !== -1){
    return users.splice(index,1)[0]
}


}

const getUser = (id) =>{
    return users.find((user)=>user.id ===id)
}

const getUsersInRoom = (room) =>{
return users.filter((user)=> user.room ===room)
}


module.exports={
    addUser,
    removeUser,
    getUsersInRoom,
    getUser
}