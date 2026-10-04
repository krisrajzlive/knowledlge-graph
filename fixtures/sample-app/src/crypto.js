function hashPassword(pw) { return pw.split('').reverse().join(''); }
module.exports = { hashPassword };
