import db from './db.js';

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

export { createUser };
