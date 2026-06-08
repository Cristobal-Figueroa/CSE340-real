// Import any needed model functions
import { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

// Define validation and sanitization rules for organization form
const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 500 })
        .withMessage('Organization description cannot exceed 500 characters'),
    body('contactEmail')
        .normalizeEmail()
        .notEmpty()
        .withMessage('Contact email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
];

// Define any controller functions
const showOrganizationsPage = async (req, res) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';

        res.render('organizations', { title, organizations });
    } catch (error) {
        console.error('Error loading organizations:', error);
        req.flash('error', 'Error loading organizations.');
        res.redirect('/');
    }
};

const showOrganizationDetailsPage = async (req, res) => {
    try {
        const organizationId = req.params.id;
        const organizationDetails = await getOrganizationDetails(organizationId);
        const projects = await getProjectsByOrganizationId(organizationId);
        const title = 'Organization Details';

        res.render('organization', {title, organizationDetails, projects});
    } catch (error) {
        console.error('Error loading organization details:', error);
        req.flash('error', 'Organization not found.');
        res.redirect('/organizations');
    }
};

const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';

    res.render('new-organization', { title });
}

const processNewOrganizationForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new organization form
        return res.redirect('/new-organization');
    }

    try {
        const { name, description, contactEmail } = req.body;
        const logoFilename = 'placeholder-logo.png';

        const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
        
        // Set a success flash message
        req.flash('success', 'Organization added successfully!');
        
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error('Error creating organization:', error);
        req.flash('error', 'Error creating organization.');
        res.redirect('/new-organization');
    }
};

const showEditOrganizationForm = async (req, res) => {
    try {
        const organizationId = req.params.id;
        const organizationDetails = await getOrganizationDetails(organizationId);

        const title = 'Edit Organization';
        res.render('edit-organization', { title, organizationDetails });
    } catch (error) {
        console.error('Error loading edit form:', error);
        req.flash('error', 'Organization not found.');
        res.redirect('/organizations');
    }
};

const processEditOrganizationForm = async (req, res) => {
    const organizationId = req.params.id;
    
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the edit organization form
        return res.redirect('/edit-organization/' + req.params.id);
    }
    
    try {
        const { name, description, contactEmail, logoFilename } = req.body;

        await updateOrganization(organizationId, name, description, contactEmail, logoFilename);
        
        // Set a success flash message
        req.flash('success', 'Organization updated successfully!');

        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error('Error updating organization:', error);
        req.flash('error', 'Error updating organization.');
        res.redirect('/edit-organization/' + organizationId);
    }
};

// Export any controller functions
export { showOrganizationsPage, showOrganizationDetailsPage, showNewOrganizationForm, processNewOrganizationForm, showEditOrganizationForm, processEditOrganizationForm, organizationValidation };
