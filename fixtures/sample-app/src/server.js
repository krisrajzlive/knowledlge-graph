const { AuthService } = require('./auth');
const auth = new AuthService();
function handleLogin(req) { return auth.login(req.user, req.pw); }
module.exports = { handleLogin };
