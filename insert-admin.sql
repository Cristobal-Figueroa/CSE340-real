-- Insert admin test account (username: admin@example.com, password: cse340!)
INSERT INTO users (name, email, password_hash, role_id) VALUES 
    ('Admin User', 'admin@example.com', '$2b$10$Bc1AkXNW7EmD0H1NI78Pbu/6bGpAZ8CR71G2ogEZ1T6ET2dqJ32Ay', (SELECT role_id FROM roles WHERE role_name = 'admin'))
ON CONFLICT (email) DO NOTHING;
