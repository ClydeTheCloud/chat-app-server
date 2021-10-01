const Message = require('./Message')

class Messages {
	constructor() {
		this.messages = []
	}

	addMessage(text, username, userId) {
		const message = new Message(text, username, userId)
		this.messages.push(message)

		return message
	}
}

module.exports = Messages
