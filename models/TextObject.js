const { nanoid } = require('nanoid')

class MessageObject {
	constructor(text) {
		this.text = text
		this.id = nanoid(8)
	}
}

module.exports = MessageObject
