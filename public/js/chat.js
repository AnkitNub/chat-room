const socket = io()  //io fucntion call to connect from client to server and server to client

//Element
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sensLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locatiomMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
 const {username,room} =Qs.parse(location.search ,{ignoreQueryPrefix: true})

const autoscroll = () =>{
    //new message element
    const $newMessage = $messages.lastElementChild  
    
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight =$newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
     $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{  //created a message template so we can give dynamic output 
        username:message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html =Mustache.render(locatiomMessageTemplate,{ //using this location template we are providing a clickable link to the user on the page
        username:message.username,
        url:message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html =Mustache.render(sidebarTemplate ,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled') //disabling the send button before the message is delivered
    //disable

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message ,(error)=>{
        //enable
        $messageFormButton.removeAttribute('disabled') //re enavbling the button so that we can send a new message again
        $messageFormInput.value = ''
        $messageFormInput.focus() //bring the cursor back to the input tab so you can type and send enter 
        if(error){
            return console.log(error)
        }
        console.log("Message delivered") 
    })
})

$sensLocationButton.addEventListener('click', () => {
    
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    $sensLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },(error)=>{
            $sensLocationButton.removeAttribute('disabled')
            if(error){
                return console.log(error)
            }
            console.log("Location send!")
        })
    })
})

socket.emit('join',{username ,room},(error)=>{
    if(error){
        alert(error)
        location.href ='/'
    }
})