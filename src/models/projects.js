import db from './db.js'

const getAllProjects = async() => {
    const query = `
        SELECT project_id, organization_id, title, description, location, date
        FROM public.service_project
        ORDER BY date;
    `;

    const result = await db.query(query);

    return result.rows;
}

const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT
            project_id,
            organization_id,
            title,
            description,
            location,
            date
        FROM service_project
        WHERE organization_id = $1
        ORDER BY date;
    `;
    
    const queryParams = [organizationId];
    const result = await db.query(query, queryParams);

    return result.rows;
};

const getUpcomingProjects = async (numberOfProjects) => {
    const query = `
        SELECT
            sp.project_id,
            sp.title,
            sp.description,
            sp.date,
            sp.location,
            sp.organization_id,
            o.name AS organization_name
        FROM service_project sp
        JOIN organization o ON sp.organization_id = o.organization_id
        WHERE sp.date >= CURRENT_DATE
        ORDER BY sp.date ASC
        LIMIT $1;
    `;
    
    const queryParams = [numberOfProjects];
    const result = await db.query(query, queryParams);

    return result.rows;
};

const getProjectDetails = async (projectId) => {
    const query = `
        SELECT
            sp.project_id,
            sp.title,
            sp.description,
            sp.date,
            sp.location,
            sp.organization_id,
            o.name AS organization_name
        FROM service_project sp
        JOIN organization o ON sp.organization_id = o.organization_id
        WHERE sp.project_id = $1;
    `;
    
    const queryParams = [projectId];
    const result = await db.query(query, queryParams);

    return result.rows.length > 0 ? result.rows[0] : null;
};

const getCategoriesByProject = async (projectId) => {
    const query = `
        SELECT
            c.category_id,
            c.name
        FROM category c
        JOIN project_category pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;
    
    const queryParams = [projectId];
    const result = await db.query(query, queryParams);

    return result.rows;
};

export { getAllProjects, getProjectsByOrganizationId, getUpcomingProjects, getProjectDetails, getCategoriesByProject }
