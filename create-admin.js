import bcrypt from 'bcrypt';

const password = 'cse340!';
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hash => {
    console.log('Password hash for cse340!:');
    console.log(hash);
    console.log('\nCopy this hash and use it in your SQL INSERT statement');
});
