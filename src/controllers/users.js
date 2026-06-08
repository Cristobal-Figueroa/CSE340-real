import bcrypt from 'bcrypt';
import { createUser } from '../models/users.js';

const showUserRegistrationForm = (req, res) => {
    const title = 'Register';
    res.render('register', { title });
};

const processUserRegistrationForm = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Hash the password before storing it
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create the user in the database
        const userId = await createUser(name, email, passwordHash);

        // Redirect to the home page after successful registration
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        
        // Check if it's a duplicate email error
        if (error.code === '23505') {
            req.flash('error', 'An account with this email already exists.');
        } else {
            req.flash('error', 'An error occurred during registration. Please try again.');
        }
        
        res.redirect('/register');
    }
};

export { showUserRegistrationForm, processUserRegistrationForm };
