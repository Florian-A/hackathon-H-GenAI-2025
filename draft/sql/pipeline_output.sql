CREATE TABLE pipeline_output (
    id INT AUTO_INCREMENT PRIMARY KEY,
    control_name VARCHAR(255) NOT NULL,
    control_description TEXT NOT NULL,
    control_tables TEXT NOT NULL,
    control_sql TEXT NOT NULL,
    control_result INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);