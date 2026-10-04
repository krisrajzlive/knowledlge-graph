const { hashPassword } = require('./crypto');
class AuthService {
  login(user, pw) { return this.verify(user, hashPassword(pw)); }
  verify(user, hash) { return user.hash === hash; }
}
module.exports = { AuthService };
