const User = require('./User')

class Users {
	constructor() {
		this.users = []
	}

	addUser(username, id) {
		const user = new User(username, id)
		this.users.push(user)
	}

	removeUserById(id) {
		const index = this.users.findIndex(u => u.id === id)
		if (index > -1) {
			this.users.splice(index, 1)
		}
	}
}

module.exports = Users
