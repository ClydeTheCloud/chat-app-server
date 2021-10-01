const Messages = require('../models/Messages')
const ACTIONS = require('../actions')

// Объект для временного хранения сообщений в памяти сервера
const allMessages = {}

module.exports = (io, socket) => {
	const { roomId, username } = socket.handshake.query

	// Если списка собщений для данной комнаты ещё нет, то мы создаём новый
	if (!allMessages[roomId]) {
		allMessages[roomId] = new Messages()
	}

	// Обработчик отправляет старые сообщений только что подключившемуся к комнате пользователю
	function getMessages() {
		if (allMessages[roomId]) {
			socket.emit(ACTIONS.INIT_MESSAGES, allMessages[roomId].messages)
		}
	}

	// Обработчик добавляения пользователем в чат нового сообщений
	function addMessage(msg) {
		// Добавляем сообщение в список
		const message = allMessages[roomId].addMessage(msg, username, socket.id)

		// Отправляем всем участникам новое сообщение
		io.in(roomId).emit(ACTIONS.MESSAGE, message)
	}

	// Регистрируем обработчики событий
	socket.on(ACTIONS.GET_MESSAGES, getMessages)
	socket.on(ACTIONS.ADD_MESSAGE, addMessage)
}
