const TextObject = require('./TextObject')

class Notice extends TextObject {
	constructor(text) {
		super(text)
		this.isNotice = true
	}
}

module.exports = Notice
