import bcrypt from 'bcrypt';
import db from '../models/db.js';
import { createUser, authenticateUser, getAllUsersWithRoles } from '../models/users.js';
import { addVolunteer, removeVolunteer, getUserVolunteeredProjects, isUserVolunteering } from '../models/volunteers.js';

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
        res.redirect('/login');
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

const showLoginForm = (req, res) => {
    const title = 'Login';
    res.render('login', { title });
};

const processLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);
        
        if (user) {
            // Store user info in session
            req.session.user = user;
            req.flash('success', 'Login successful!');

            if (process.env.NODE_ENV === 'development') {
                console.log('User logged in:', user);
            }

            res.redirect('/dashboard');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

const processLogout = async (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }

    req.flash('success', 'Logout successful!');
    res.redirect('/login');
};

const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }
    next();
};

const requireRole = (roleName) => {
    return async (req, res, next) => {
        if (!req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        try {
            // Get role_id for the required role
            const roleQuery = 'SELECT role_id FROM roles WHERE role_name = $1';
            const roleResult = await db.query(roleQuery, [roleName]);
            
            if (roleResult.rows.length === 0) {
                throw new Error(`Role ${roleName} not found`);
            }
            
            const requiredRoleId = roleResult.rows[0].role_id;
            
            // Check if user has the required role
            if (req.session.user.role_id !== requiredRoleId) {
                req.flash('error', 'You do not have permission to access this page.');
                return res.redirect('/dashboard');
            }
            
            next();
        } catch (error) {
            console.error('Error checking role:', error);
            req.flash('error', 'An error occurred. Please try again.');
            res.redirect('/dashboard');
        }
    };
};

const showDashboard = async (req, res) => {
    const user = req.session.user;
    
    try {
        const volunteeredProjects = await getUserVolunteeredProjects(user.user_id);
        
        res.render('dashboard', { 
            title: 'Dashboard',
            name: user.name,
            email: user.email,
            volunteeredProjects
        });
    } catch (error) {
        console.error('Error loading volunteered projects:', error);
        res.render('dashboard', { 
            title: 'Dashboard',
            name: user.name,
            email: user.email,
            volunteeredProjects: []
        });
    }
};

const showUsersPage = async (req, res) => {
    try {
        const users = await getAllUsersWithRoles();
        const title = 'Registered Users';
        
        res.render('users', { title, users });
    } catch (error) {
        console.error('Error loading users:', error);
        req.flash('error', 'Error loading users.');
        res.redirect('/dashboard');
    }
};

const addVolunteerController = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.session.user.user_id;

    try {
        await addVolunteer(userId, projectId);
        req.flash('success', 'You have successfully volunteered for this project!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error adding volunteer:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect(`/project/${projectId}`);
    }
};

const removeVolunteerController = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.session.user.user_id;

    try {
        await removeVolunteer(userId, projectId);
        req.flash('success', 'You have been removed from this project.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error removing volunteer:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect(`/project/${projectId}`);
    }
};

export { showUserRegistrationForm, processUserRegistrationForm, showLoginForm, processLoginForm, processLogout, requireLogin, requireRole, showDashboard, showUsersPage, addVolunteerController, removeVolunteerController };
