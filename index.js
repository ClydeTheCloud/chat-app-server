// Настраиваем сервер
const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')

const socketCors = {
	cors: {
		origin: '*',
	},
}

const app = express()
app.use(cors())
const server = http.createServer(app)
const io = new socketio.Server(server, socketCors)

const handleMessages = require('./handlers/handleMessages')
const handleUsers = require('./handlers/handleUsers')
const handleCalls = require('./handlers/handleCalls')
const ACTIONS = require('./actions')

io.on(ACTIONS.CONNCECT, socket => {
	const { roomId } = socket.handshake.query
	socket.join(roomId)

	// Регистрируем обработчики событий для сокетов
	// Обработчики сообщений в чате
	handleMessages(io, socket)
	// Обработчики отслеживающие онлайн пользователей в комнатах
	handleUsers(io, socket)
	// Обработчики для P2P соединения и звонков
	handleCalls(io, socket)

	socket.on(ACTIONS.DISCONNECT, () => {
		socket.leave(roomId)
	})
})

const PORT = process.env.PORT || 3001
server.listen(PORT, error => {
	if (error) throw error
	console.log(`Сервер запущен, порт ${PORT}`)
})
