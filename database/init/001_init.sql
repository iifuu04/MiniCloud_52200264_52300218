-- Tạo database
CREATE DATABASE IF NOT EXISTS Mini_Cloud;
USE Mini_Cloud;

CREATE TABLE classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL
);

CREATE TABLE subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(50) NOT NULL
);

CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    class_id INT,
    FOREIGN KEY (class_id) REFERENCES classes(class_id)
);

CREATE TABLE grades (
    grade_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject_id INT,
    score DECIMAL(5, 2) CHECK (score >= 0 AND score <= 10),
    exam_date DATE,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

-- Thêm dữ liệu mẫu
INSERT INTO classes (class_name) VALUES
    ('10A1'), ('10A2'), ('11A1');

INSERT INTO students (full_name, date_of_birth, class_id) VALUES
    ('Nguyen Van A', '2010-05-15', 1),
    ('Nguyen Van B', '2010-06-20', 1),
    ('Nguyen Van C', '2010-03-10', 2);

INSERT INTO subjects (subject_name) VALUES
    ('Toan'), ('Ly'), ('Hoa');

INSERT INTO grades (student_id, subject_id, score, exam_date) VALUES
    (1, 1, 8.5, '2025-10-01'),
    (1, 2, 7.0, '2025-10-01'),
    (2, 1, 9.0, '2025-10-01'),
    (3, 3, 6.5, '2025-10-02');