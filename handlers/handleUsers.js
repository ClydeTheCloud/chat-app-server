const Notice = require('../models/Notice')
const Users = require('../models/Users')
const ACTIONS = require('../actions')

// Объект для хранения списков пользователей, которые находятся онлайн в той или иной комнате
const allUsers = {}

module.exports = (io, socket) => {
	const { roomId, username } = socket.handshake.query

	// Если списка пользователей ещё нет
	if (!allUsers[roomId]) {
		allUsers[roomId] = new Users()
	}

	// Добавляем подключившийся сокет в список активных пользователей
	allUsers[roomId].addUser(username, socket.id)

	// Обрабатываем подключение нового пользователя к чату
	function onUserJoin() {
		// Создаём уведомление о подключении нового пользователя и отправляем его всем пользователям в комнате, кроме самого подключившегося
		const joinNotice = new Notice(`Поприветствуем ${username} в чате!`)
		socket.in(roomId).emit(ACTIONS.NOTICE, joinNotice)

		// Самому пользователю отправляем уведомление с приветствием
		const welcomeNotice = new Notice(`Добро пожаловать в комнату ${roomId}`)
		socket.emit(ACTIONS.NOTICE, welcomeNotice)

		// Рассылаем всей комнате новый список пользователей находящихся в онлайне
		io.in(roomId).emit(ACTIONS.USERS, allUsers[roomId].users)
	}

	// Обрабатываем отключение пользователя от чата
	function onUserLeave() {
		// Удаляем пользователя из списка активных
		allUsers[roomId].removeUserById(socket.id)

		// Создаём и отправляем уведомление о том что пользователь покинул чат
		const leaveNotice = new Notice(`${username} покинул чат.`)
		socket.in(roomId).emit(ACTIONS.NOTICE, leaveNotice)

		// Рассылаем всей комнате новый список пользователей находящихся в онлайне
		io.in(roomId).emit(ACTIONS.USERS, allUsers[roomId].users)
	}

	// Регистрируем обработчики событий
	socket.on(ACTIONS.CONNECTION_ESTABLISHED, onUserJoin)
	socket.on(ACTIONS.DISCONNECT, onUserLeave)
}
