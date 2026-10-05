const { AuthService } = require('./auth');
const { hashPassword } = require('./crypto');

class SessionStore {
  constructor() { this.auth = new AuthService(); this.sessions = new Map(); }
  open(user, pw) {
    if (!this.auth.login(user, pw)) return null;
    const token = hashPassword(user.name + Date.now());
    this.sessions.set(token, user);
    return token;
  }
  close(token) { return this.sessions.delete(token); }
}
module.exports = { SessionStore };
