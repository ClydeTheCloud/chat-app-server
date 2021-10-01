const Notice = require('../models/Notice')
const ACTIONS = require('../actions')

// Состояние звонка в комнате
let isCalling = false
// ID сокета, который будет транслировать видео
let callerId

module.exports = (io, socket) => {
	const { roomId, username } = socket.handshake.query

	// Пользователь инициировал звонок, записываем его id, меняем статус, оповещаем остальные сокеты
	function initCall() {
		emitCallStatus(true)
		callerId = socket.id
		const callNotice = new Notice(`${username} начал звонок`)
		io.in(roomId).emit(ACTIONS.NOTICE, callNotice)
	}

	// Сокет желающий присоединиться к звонку оповещает об этом звонящего
	function readyToJoin(id) {
		io.to(callerId).emit(ACTIONS.CALL_READY_TO_JOIN, id)
	}

	// Передача сигналов между сокетами
	function transmitSignal({ to, signal, from }) {
		const data = { id: from, signal }
		io.to(to).emit(ACTIONS.CALL_SIGNAL, data)
	}

	//  Если инициировавший звонок пользователь вышел или отключился, то сбрасываем состояние и оповещаем об это остальные сокеты
	function onUserLeave() {
		if (socket.id === callerId) {
			socket.in(roomId).emit(ACTIONS.CALL_ENDED)
			callerId = null
			emitCallStatus(false)
			const callEndedNotice = new Notice(`${username} завершил звонок`)
			io.in(roomId).emit(ACTIONS.NOTICE, callEndedNotice)
		}
	}

	// Обновляем состояние и оповещаем об этом сокеты
	function emitCallStatus(status) {
		isCalling = status
		io.in(roomId).emit(ACTIONS.CALL_STATUS, status)
	}

	// Отправляем состояние только одному сокету, функция срабатывает при подключении
	function emitCallStatusLocaly() {
		socket.in(roomId).emit(ACTIONS.CALL_STATUS, isCalling)
	}

	// Назначаем обработчики событий
	socket.on(ACTIONS.CALL_INIT, initCall)
	socket.on(ACTIONS.CALL_READY_TO_JOIN, readyToJoin)
	socket.on(ACTIONS.CALL_SIGNAL, transmitSignal)
	socket.on(ACTIONS.DISCONNECT, onUserLeave)
	socket.on(ACTIONS.CALL_LEAVE, onUserLeave)
	socket.on(ACTIONS.CONNCECT, emitCallStatusLocaly)
}
