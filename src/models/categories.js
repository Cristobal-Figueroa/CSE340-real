import db from './db.js'

const getAllCategories = async() => {
    const query = `
        SELECT category_id, name
        FROM public.category
        ORDER BY name;
    `;

    const result = await db.query(query);

    return result.rows;
}

const getCategoryDetails = async (categoryId) => {
    const query = `
        SELECT
            category_id,
            name
        FROM category
        WHERE category_id = $1;
    `;

    const queryParams = [categoryId];
    const result = await db.query(query, queryParams);

    return result.rows.length > 0 ? result.rows[0] : null;
};

const getProjectsByCategory = async (categoryId) => {
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
        JOIN project_category pc ON sp.project_id = pc.project_id
        JOIN organization o ON sp.organization_id = o.organization_id
        WHERE pc.category_id = $1
        ORDER BY sp.date;
    `;
    
    const queryParams = [categoryId];
    const result = await db.query(query, queryParams);

    return result.rows;
};

const getCategoriesByServiceProjectId = async (projectId) => {
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

const assignCategoryToProject = async (projectId, categoryId) => {
    const query = `
        INSERT INTO project_category (project_id, category_id)
        VALUES ($1, $2)
    `;
    
    const queryParams = [projectId, categoryId];
    await db.query(query, queryParams);
};

const updateCategoryAssignments = async (projectId, categoryIds) => {
    // First, delete all existing category assignments for this project
    const deleteQuery = `
        DELETE FROM project_category
        WHERE project_id = $1
    `;
    
    await db.query(deleteQuery, [projectId]);
    
    // Then, insert the new category assignments
    for (const categoryId of categoryIds) {
        await assignCategoryToProject(projectId, categoryId);
    }
    
    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log(`Updated category assignments for project ${projectId}`);
    }
};

const createCategory = async (name) => {
    const query = `
      INSERT INTO category (name)
      VALUES ($1)
      RETURNING category_id
    `;

    const queryParams = [name];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create category');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new category with ID:', result.rows[0].category_id);
    }

    return result.rows[0].category_id;
};

const updateCategory = async (id, name) => {
    const query = `
        UPDATE category
        SET name = $1
        WHERE category_id = $2
    `;

    const queryParams = [name, id];
    const result = await db.query(query, queryParams);

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated category with ID:', id);
    }

    return result;
};

export { getAllCategories, getCategoryDetails, getProjectsByCategory, getCategoriesByServiceProjectId, updateCategoryAssignments, createCategory, updateCategory }
