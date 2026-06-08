import db from './db.js';
import bcrypt from 'bcrypt';

/**
 * Creates a new user in the database with the "user" role
 * @param {string} name - The user's display name
 * @param {string} email - The user's email (used as username)
 * @param {string} passwordHash - The hashed password
 * @returns {number} The id of the newly created user
 */
const createUser = async (name, email, passwordHash) => {
    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = 'user'))
        RETURNING user_id
    `;

    const queryParams = [name, email, passwordHash];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

/**
 * Finds a user by their email address
 * @param {string} email - The user's email
 * @returns {object|null} The user object or null if not found
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT user_id, name, email, password_hash, role_id 
        FROM users 
        WHERE email = $1
    `;
    const queryParams = [email];
    
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        return null; // User not found
    }
    
    return result.rows[0];
};

/**
 * Verifies a password against a hash
 * @param {string} password - Plain text password
 * @param {string} passwordHash - Hashed password from database
 * @returns {boolean} True if password matches, false otherwise
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Authenticates a user by email and password
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {object|null} User object without password_hash if authenticated, null otherwise
 */
const authenticateUser = async (email, password) => {
    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
        return null; // User not found
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    
    if (!isPasswordValid) {
        return null; // Invalid password
    }
    
    // Remove password_hash before returning user
    const { password_hash, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
};

/**
 * Gets all users with their role information
 * @returns {Array} Array of user objects with role names
 */
const getAllUsersWithRoles = async () => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.created_at, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.created_at DESC
    `;
    
    const result = await db.query(query);
    return result.rows;
};

export { createUser, authenticateUser, getAllUsersWithRoles };
