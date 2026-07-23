INSERT INTO users (name, email, password_hash, role, full_name, group_name)
VALUES ('Скриншот Тест', 'screenshot_demo@propuzzle.local', 'KhIAA1-MYNnI8NuCbLWhwg==$0UfzQQbVG6oK0SV5K-e_SnGUlSj7Ke1DRLxLvXJdW38=', 'teacher', 'Демо Преподаватель', NULL)
ON CONFLICT (email) DO NOTHING;