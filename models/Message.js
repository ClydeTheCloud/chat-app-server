const TextObject = require('./TextObject')

class Message extends TextObject {
	constructor(text, username, userId) {
		super(text)
		this.userId = userId
		this.username = username
		this.date = new Date()
	}
}

module.exports = Message
