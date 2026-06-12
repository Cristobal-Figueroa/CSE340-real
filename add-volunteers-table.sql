-- Create volunteers table for many-to-many relationship between users and service_project
CREATE TABLE IF NOT EXISTS volunteers (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES service_project(project_id) ON DELETE CASCADE,
    signed_up_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, project_id)
);
