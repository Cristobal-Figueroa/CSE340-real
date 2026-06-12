import db from './db.js';

/**
 * Adds a user as a volunteer for a project
 * @param {number} userId - The user's ID
 * @param {number} projectId - The project's ID
 * @returns {boolean} True if successful, false if already volunteering
 */
const addVolunteer = async (userId, projectId) => {
    const query = `
        INSERT INTO volunteers (user_id, project_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, project_id) DO NOTHING
        RETURNING user_id
    `;
    
    const result = await db.query(query, [userId, projectId]);
    return result.rows.length > 0;
};

/**
 * Removes a user as a volunteer from a project
 * @param {number} userId - The user's ID
 * @param {number} projectId - The project's ID
 * @returns {boolean} True if a row was deleted, false otherwise
 */
const removeVolunteer = async (userId, projectId) => {
    const query = `
        DELETE FROM volunteers
        WHERE user_id = $1 AND project_id = $2
    `;
    
    const result = await db.query(query, [userId, projectId]);
    return result.rowCount > 0;
};

/**
 * Gets all projects a user has volunteered for
 * @param {number} userId - The user's ID
 * @returns {Array} Array of project objects
 */
const getUserVolunteeredProjects = async (userId) => {
    const query = `
        SELECT p.project_id, p.title, p.description, p.date, p.location, 
               p.organization_id, o.name as organization_name
        FROM service_project p
        JOIN volunteers v ON p.project_id = v.project_id
        JOIN organization o ON p.organization_id = o.organization_id
        WHERE v.user_id = $1
        ORDER BY p.date ASC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Checks if a user is volunteering for a specific project
 * @param {number} userId - The user's ID
 * @param {number} projectId - The project's ID
 * @returns {boolean} True if user is volunteering, false otherwise
 */
const isUserVolunteering = async (userId, projectId) => {
    const query = `
        SELECT 1 FROM volunteers
        WHERE user_id = $1 AND project_id = $2
    `;
    
    const result = await db.query(query, [userId, projectId]);
    return result.rows.length > 0;
};

export { addVolunteer, removeVolunteer, getUserVolunteeredProjects, isUserVolunteering };
