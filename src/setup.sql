-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS project_category CASCADE;
DROP TABLE IF EXISTS service_project CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS organization CASCADE;

-- Create organization table
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    contact_email VARCHAR(100),
    logo_filename VARCHAR(255)
);

-- Create service_project table
CREATE TABLE service_project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    date DATE,
    FOREIGN KEY (organization_id) REFERENCES organization(organization_id) ON DELETE CASCADE
);

-- Create category table
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Create junction table for many-to-many relationship between projects and categories
CREATE TABLE project_category (
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id) REFERENCES service_project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE CASCADE
);

-- Insert organizations
INSERT INTO organization (name, description, contact_email, logo_filename) VALUES
('BrightFuture', 'Empowering youth through education and mentorship programs in underserved communities.', 'contact@brightfuture.org', 'brightfuture-logo.png'),
('GreenHarvest', 'Promoting sustainable agriculture and environmental stewardship across rural regions.', 'info@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe', 'Building stronger communities by coordinating volunteer efforts and local outreach events.', 'hello@unityserve.org', 'unityserve-logo.png');

-- Insert service projects
INSERT INTO service_project (organization_id, title, description, location, date) VALUES
(1, 'Youth Mentorship Program', 'Weekly mentoring sessions for high school students focusing on college preparation and career guidance.', 'Downtown Community Center', '2026-06-15'),
(1, 'After-School Tutoring', 'Free tutoring services for elementary students in math and reading.', 'Lincoln Elementary School', '2026-05-20'),
(2, 'Community Garden Project', 'Help build and maintain a sustainable community garden that provides fresh produce to local families.', 'Riverside Park', '2026-07-10'),
(2, 'Tree Planting Initiative', 'Join us in planting native trees to restore local ecosystems and improve air quality.', 'Greenwood Forest', '2026-08-05'),
(3, 'Food Bank Volunteer Day', 'Sort and pack food donations for distribution to families in need.', 'Central Food Bank', '2026-05-25'),
(3, 'Neighborhood Cleanup', 'Community-wide cleanup event to beautify local parks and streets.', 'Various Locations', '2026-06-01');

-- Insert categories
INSERT INTO category (name) VALUES
('Environmental'),
('Educational'),
('Community Service'),
('Health and Wellness');

-- Associate projects with categories
INSERT INTO project_category (project_id, category_id) VALUES
-- Youth Mentorship Program: Educational
(1, 2),
-- After-School Tutoring: Educational
(2, 2),
-- Community Garden Project: Environmental, Health and Wellness
(3, 1),
(3, 4),
-- Tree Planting Initiative: Environmental
(4, 1),
-- Food Bank Volunteer Day: Community Service, Health and Wellness
(5, 3),
(5, 4),
-- Neighborhood Cleanup: Environmental, Community Service
(6, 1),
(6, 3);
