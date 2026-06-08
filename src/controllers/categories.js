// Import any needed model functions
import { getAllCategories, getCategoryDetails, getProjectsByCategory, getCategoriesByServiceProjectId, updateCategoryAssignments, createCategory, updateCategory } from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

// Define validation rules for category form
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Category name must be between 3 and 100 characters')
];

// Define any controller functions
const showCategoriesPage = async (req, res) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Categories';

        res.render('categories', { title, categories });
    } catch (error) {
        console.error('Error loading categories:', error);
        req.flash('error', 'Error loading categories.');
        res.redirect('/');
    }
};

const showCategoryDetailsPage = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const categoryDetails = await getCategoryDetails(categoryId);
        const projects = await getProjectsByCategory(categoryId);
        const title = 'Category Details';

        res.render('category', { title, categoryDetails, projects });
    } catch (error) {
        console.error('Error loading category details:', error);
        req.flash('error', 'Category not found.');
        res.redirect('/categories');
    }
};

const showAssignCategoriesForm = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        const projectDetails = await getProjectDetails(projectId);
        const categories = await getAllCategories();
        const assignedCategories = await getCategoriesByServiceProjectId(projectId);

        const title = 'Assign Categories to Project';

        res.render('assign-categories', { title, projectId, projectDetails, categories, assignedCategories });
    } catch (error) {
        console.error('Error loading assign categories form:', error);
        req.flash('error', 'Error loading form.');
        res.redirect('/projects');
    }
};

const processAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;
    
    try {
        const selectedCategoryIds = req.body.categoryIds || [];
        
        // Ensure selectedCategoryIds is an array
        const categoryIdsArray = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [selectedCategoryIds];
        await updateCategoryAssignments(projectId, categoryIdsArray);
        req.flash('success', 'Categories updated successfully.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error updating categories:', error);
        req.flash('error', 'Error updating categories.');
        res.redirect(`/assign-categories/${projectId}`);
    }
};

const showNewCategoryForm = async (req, res) => {
    const title = 'Add New Category';
    res.render('new-category', { title });
};

const processNewCategoryForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        return res.redirect('/new-category');
    }

    try {
        const { name } = req.body;
        const categoryId = await createCategory(name);
        
        req.flash('success', 'Category added successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        console.error('Error creating category:', error);
        req.flash('error', 'Error creating category.');
        res.redirect('/new-category');
    }
};

const showEditCategoryForm = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const categoryDetails = await getCategoryDetails(categoryId);

        const title = 'Edit Category';
        res.render('edit-category', { title, categoryDetails });
    } catch (error) {
        console.error('Error loading edit form:', error);
        req.flash('error', 'Category not found.');
        res.redirect('/categories');
    }
};

const processEditCategoryForm = async (req, res) => {
    const categoryId = req.params.id;
    
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        return res.redirect('/edit-category/' + req.params.id);
    }
    
    try {
        const { name } = req.body;
        await updateCategory(categoryId, name);
        
        req.flash('success', 'Category updated successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        console.error('Error updating category:', error);
        req.flash('error', 'Error updating category.');
        res.redirect('/edit-category/' + categoryId);
    }
};

// Export any controller functions
export { showCategoriesPage, showCategoryDetailsPage, showAssignCategoriesForm, processAssignCategoriesForm, showNewCategoryForm, processNewCategoryForm, showEditCategoryForm, processEditCategoryForm, categoryValidation };
