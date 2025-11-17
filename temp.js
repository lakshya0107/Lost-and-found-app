// createAdmin.js
const bcrypt = require('bcryptjs');

// Set the admin password you want to use here
const password = 'hello123';

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('--- Copy this hash ---');
console.log(hash);
console.log('-----------------------');