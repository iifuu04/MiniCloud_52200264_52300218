import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from functools import wraps
import mysql.connector.pooling
from mysql.connector import Error
import jwt
from jwt import PyJWKClient
from werkzeug.exceptions import Unauthorized

app = Flask(__name__)
CORS(app)

# Environment variables
OIDC_ISSUER = os.getenv('OIDC_ISSUER')
OIDC_AUDIENCE = os.getenv('OIDC_AUDIENCE')
ALGORITHMS = ['RS256']

DB_HOST = os.getenv('DB_HOST', 'database')
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'root')
DB_NAME = os.getenv('DB_NAME', 'Mini_Cloud')
DB_POOL_LIMIT = int(os.getenv('DB_POOL_LIMIT', 5))

# Validate required environment variables
missing_env = []
if not OIDC_ISSUER:
    missing_env.append('OIDC_ISSUER')
if not OIDC_AUDIENCE:
    missing_env.append('OIDC_AUDIENCE')

if missing_env:
    print(f"Missing required environment variables: {', '.join(missing_env)}")
    exit(1)

print("OIDC Configuration:")
print(f"  ISSUER: {OIDC_ISSUER}")
print(f"  AUDIENCE: {OIDC_AUDIENCE}")

JWKS_URI = f"{OIDC_ISSUER.rstrip('/')}/protocol/openid-connect/certs"
print(f"  JWKS URI: {JWKS_URI}")

print("Database configuration:")
print(f"  HOST: {DB_HOST}")
print(f"  PORT: {DB_PORT}")
print(f"  USER: {DB_USER}")
print(f"  DB NAME: {DB_NAME}")
print(f"  POOL LIMIT: {DB_POOL_LIMIT}")

# Initialize JWKS client
jwks_client = PyJWKClient(JWKS_URI)

# Initialize database connection pool
db_pool = None


def init_db_pool():
    """Initialize database connection pool with retry logic"""
    global db_pool
    import time
    max_retries = 10
    retry_delay = 3

    for attempt in range(max_retries):
        try:
            db_pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name="mypool",
                pool_size=DB_POOL_LIMIT,
                pool_reset_session=True,
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                database=DB_NAME,
                autocommit=True,
                raise_on_warnings=False,
                connection_timeout=10,
                use_unicode=True,
                charset='utf8mb4'
            )
            # Test connection
            conn = db_pool.get_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT 1')
            result = cursor.fetchone()  # Fetch result to avoid "Unread result found" error
            cursor.close()
            conn.close()
            print("MySQL connection established")
            return True
        except Error as e:
            print(
                f"Failed to initialize MySQL pool (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("Failed to connect to MySQL after all retries")
                print(
                    f"Connection details: host={DB_HOST}, port={DB_PORT}, user={DB_USER}, database={DB_NAME}")
                return False
        except Exception as e:
            print(
                f"Unexpected error initializing MySQL pool (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("Failed to connect to MySQL after all retries")
                return False
    return False


# Initialize database pool
init_db_pool()


def get_pool():
    """Get database pool, reinitialize if needed"""
    global db_pool
    if not db_pool:
        print("Database pool not initialized, attempting to reconnect...")
        if not init_db_pool():
            raise Exception(
                'Database pool not initialized or connection failed')
    return db_pool


def verify_jwt_token(token):
    """Verify JWT token using JWKS"""
    try:
        # Get signing key from JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=ALGORITHMS,
            audience=OIDC_AUDIENCE,
            options={"verify_exp": True}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise Unauthorized("Token has expired")
    except jwt.InvalidTokenError as e:
        raise Unauthorized(f"Invalid token: {str(e)}")


def jwt_required(f):
    """Decorator to protect routes with JWT"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']

        if not auth_header:
            return jsonify({'error': 'Unauthorized', 'details': 'Missing Authorization header'}), 401

        try:
            # Extract token from "Bearer <token>"
            token = auth_header.split(
                ' ')[1] if ' ' in auth_header else auth_header
            payload = verify_jwt_token(token)
            # Store payload in request context
            request.auth = payload
        except Unauthorized as e:
            return jsonify({'error': 'Unauthorized', 'details': str(e)}), 401
        except Exception as e:
            return jsonify({'error': 'Unauthorized', 'details': str(e)}), 401

        return f(*args, **kwargs)
    return decorated_function

# Public routes


@app.route('/hello', methods=['GET'])
@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello, world!'})


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    db_status = False
    db_error = None
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        result = cursor.fetchone()  # Fetch result to avoid "Unread result found" error
        cursor.close()
        conn.close()
        db_status = True
    except Exception as e:
        db_error = str(e)

    return jsonify({
        'status': 'ok',
        'database': {
            'connected': db_status,
            'error': db_error
        }
    }), 200 if db_status else 503


@app.route('/api/student', methods=['GET'])
def get_students_from_file():
    """Get students from JSON file (legacy endpoint)"""
    try:
        students_path = os.path.join(
            os.path.dirname(__file__), 'students.json')
        with open(students_path, 'r', encoding='utf-8') as f:
            students = json.load(f)
        return jsonify(students)
    except FileNotFoundError:
        return jsonify({'error': 'Failed to read students data'}), 500
    except json.JSONDecodeError as e:
        return jsonify({'error': 'Failed to parse students data', 'details': str(e)}), 500


@app.route('/api/db-test', methods=['GET'])
def db_test():
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT NOW() AS serverTime')
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        return jsonify({
            'connected': True,
            'serverTime': str(result['serverTime']) if result else None,
            'database': DB_NAME,
            'host': DB_HOST
        })
    except Exception as e:
        print(f"DB test error: {e}")
        return jsonify({
            'error': 'Database connection failed',
            'details': str(e),
            'database': DB_NAME,
            'host': DB_HOST
        }), 500


# ==================== SUBJECTS CRUD ====================

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """Get all subjects"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'SELECT subject_id AS id, subject_name AS name FROM subjects ORDER BY subject_id ASC'
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)
    except Error as e:
        print(f"Database error in get_subjects: {e}")
        return jsonify({
            'error': 'Failed to read subjects from database',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in get_subjects: {e}")
        return jsonify({
            'error': 'Failed to read subjects from database',
            'details': str(e)
        }), 500


@app.route('/api/subjects', methods=['POST'])
def create_subject():
    """Create a new subject"""
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Missing required field: name'}), 400

        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'INSERT INTO subjects (subject_name) VALUES (%s)',
            (data['name'],)
        )
        conn.commit()
        subject_id = cursor.lastrowid
        cursor.execute(
            'SELECT subject_id AS id, subject_name AS name FROM subjects WHERE subject_id = %s',
            (subject_id,)
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result), 201
    except Error as e:
        print(f"Database error in create_subject: {e}")
        return jsonify({
            'error': 'Failed to create subject',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in create_subject: {e}")
        return jsonify({
            'error': 'Failed to create subject',
            'details': str(e)
        }), 500


@app.route('/api/subjects/<int:subject_id>', methods=['GET'])
def get_subject(subject_id):
    """Get a subject by ID"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'SELECT subject_id AS id, subject_name AS name FROM subjects WHERE subject_id = %s',
            (subject_id,)
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if not result:
            return jsonify({'error': 'Subject not found'}), 404
        return jsonify(result)
    except Error as e:
        print(f"Database error in get_subject: {e}")
        return jsonify({
            'error': 'Failed to read subject from database',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in get_subject: {e}")
        return jsonify({
            'error': 'Failed to read subject from database',
            'details': str(e)
        }), 500


@app.route('/api/subjects/<int:subject_id>', methods=['PUT'])
def update_subject(subject_id):
    """Update a subject"""
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Missing required field: name'}), 400

        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'UPDATE subjects SET subject_name = %s WHERE subject_id = %s',
            (data['name'], subject_id)
        )
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Subject not found'}), 404

        cursor.execute(
            'SELECT subject_id AS id, subject_name AS name FROM subjects WHERE subject_id = %s',
            (subject_id,)
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result)
    except Error as e:
        print(f"Database error in update_subject: {e}")
        return jsonify({
            'error': 'Failed to update subject',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in update_subject: {e}")
        return jsonify({
            'error': 'Failed to update subject',
            'details': str(e)
        }), 500


@app.route('/api/subjects/<int:subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    """Delete a subject"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            'DELETE FROM subjects WHERE subject_id = %s', (subject_id,))
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Subject not found'}), 404

        cursor.close()
        conn.close()
        return jsonify({'message': 'Subject deleted successfully'}), 200
    except Error as e:
        print(f"Database error in delete_subject: {e}")
        if e.errno == 1451:  # Foreign key constraint
            return jsonify({
                'error': 'Cannot delete subject: it is referenced by grades',
                'details': str(e)
            }), 409
        return jsonify({
            'error': 'Failed to delete subject',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in delete_subject: {e}")
        return jsonify({
            'error': 'Failed to delete subject',
            'details': str(e)
        }), 500

# ==================== CLASSES CRUD ====================


@app.route('/api/classes', methods=['GET'])
def get_classes():
    """Get all classes"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'SELECT class_id AS id, class_name AS name FROM classes ORDER BY class_id ASC'
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)
    except Error as e:
        print(f"Database error in get_classes: {e}")
        return jsonify({
            'error': 'Failed to read classes from database',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in get_classes: {e}")
        return jsonify({
            'error': 'Failed to read classes from database',
            'details': str(e)
        }), 500


@app.route('/api/classes', methods=['POST'])
def create_class():
    """Create a new class"""
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Missing required field: name'}), 400

        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'INSERT INTO classes (class_name) VALUES (%s)',
            (data['name'],)
        )
        conn.commit()
        class_id = cursor.lastrowid
        cursor.execute(
            'SELECT class_id AS id, class_name AS name FROM classes WHERE class_id = %s',
            (class_id,)
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result), 201
    except Error as e:
        print(f"Database error in create_class: {e}")
        return jsonify({
            'error': 'Failed to create class',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in create_class: {e}")
        return jsonify({
            'error': 'Failed to create class',
            'details': str(e)
        }), 500


@app.route('/api/classes/<int:class_id>', methods=['GET'])
def get_class(class_id):
    """Get a class by ID"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'SELECT class_id AS id, class_name AS name FROM classes WHERE class_id = %s',
            (class_id,)
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if not result:
            return jsonify({'error': 'Class not found'}), 404
        return jsonify(result)
    except Error as e:
        print(f"Database error in get_class: {e}")
        return jsonify({
            'error': 'Failed to read class from database',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in get_class: {e}")
        return jsonify({
            'error': 'Failed to read class from database',
            'details': str(e)
        }), 500


@app.route('/api/classes/<int:class_id>', methods=['PUT'])
def update_class(class_id):
    """Update a class"""
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Missing required field: name'}), 400

        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'UPDATE classes SET class_name = %s WHERE class_id = %s',
            (data['name'], class_id)
        )
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Class not found'}), 404

        cursor.execute(
            'SELECT class_id AS id, class_name AS name FROM classes WHERE class_id = %s',
            (class_id,)
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result)
    except Error as e:
        print(f"Database error in update_class: {e}")
        return jsonify({
            'error': 'Failed to update class',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in update_class: {e}")
        return jsonify({
            'error': 'Failed to update class',
            'details': str(e)
        }), 500


@app.route('/api/classes/<int:class_id>', methods=['DELETE'])
def delete_class(class_id):
    """Delete a class"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM classes WHERE class_id = %s', (class_id,))
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Class not found'}), 404

        cursor.close()
        conn.close()
        return jsonify({'message': 'Class deleted successfully'}), 200
    except Error as e:
        print(f"Database error in delete_class: {e}")
        if e.errno == 1451:  # Foreign key constraint
            return jsonify({
                'error': 'Cannot delete class: it is referenced by students',
                'details': str(e)
            }), 409
        return jsonify({
            'error': 'Failed to delete class',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in delete_class: {e}")
        return jsonify({
            'error': 'Failed to delete class',
            'details': str(e)
        }), 500

# ==================== STUDENTS CRUD ====================


@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT 
                s.student_id AS id,
                s.full_name AS name,
                s.date_of_birth AS dateOfBirth,
                s.class_id AS classId,
                c.class_name AS className
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.class_id
            ORDER BY s.student_id ASC
        ''')
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)
    except Error as e:
        print(f"Database error in get_students: {e}")
        return jsonify({
            'error': 'Failed to read students from database',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in get_students: {e}")
        return jsonify({
            'error': 'Failed to read students from database',
            'details': str(e)
        }), 500


@app.route('/api/students', methods=['POST'])
def create_student():
    """Create a new student"""
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Missing required field: name'}), 400

        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            INSERT INTO students (full_name, date_of_birth, class_id)
            VALUES (%s, %s, %s)
        ''', (
            data['name'],
            data.get('dateOfBirth'),
            data.get('classId')
        ))
        conn.commit()
        student_id = cursor.lastrowid
        cursor.execute('''
            SELECT 
                s.student_id AS id,
                s.full_name AS name,
                s.date_of_birth AS dateOfBirth,
                s.class_id AS classId,
                c.class_name AS className
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.student_id = %s
        ''', (student_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result), 201
    except Error as e:
        print(f"Database error in create_student: {e}")
        if e.errno == 1452:  # Foreign key constraint
            return jsonify({
                'error': 'Invalid class_id: class does not exist',
                'details': str(e)
            }), 400
        return jsonify({
            'error': 'Failed to create student',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in create_student: {e}")
        return jsonify({
            'error': 'Failed to create student',
            'details': str(e)
        }), 500


@app.route('/api/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    """Get a student by ID"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT 
                s.student_id AS id,
                s.full_name AS name,
                s.date_of_birth AS dateOfBirth,
                s.class_id AS classId,
                c.class_name AS className
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.student_id = %s
        ''', (student_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if not result:
            return jsonify({'error': 'Student not found'}), 404
        return jsonify(result)
    except Error as e:
        print(f"Database error in get_student: {e}")
        return jsonify({
            'error': 'Failed to read student from database',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in get_student: {e}")
        return jsonify({
            'error': 'Failed to read student from database',
            'details': str(e)
        }), 500


@app.route('/api/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    """Update a student"""
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Missing required field: name'}), 400

        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            UPDATE students 
            SET full_name = %s, date_of_birth = %s, class_id = %s
            WHERE student_id = %s
        ''', (
            data['name'],
            data.get('dateOfBirth'),
            data.get('classId'),
            student_id
        ))
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Student not found'}), 404

        cursor.execute('''
            SELECT 
                s.student_id AS id,
                s.full_name AS name,
                s.date_of_birth AS dateOfBirth,
                s.class_id AS classId,
                c.class_name AS className
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.student_id = %s
        ''', (student_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result)
    except Error as e:
        print(f"Database error in update_student: {e}")
        if e.errno == 1452:  # Foreign key constraint
            return jsonify({
                'error': 'Invalid class_id: class does not exist',
                'details': str(e)
            }), 400
        return jsonify({
            'error': 'Failed to update student',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in update_student: {e}")
        return jsonify({
            'error': 'Failed to update student',
            'details': str(e)
        }), 500


@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete a student"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            'DELETE FROM students WHERE student_id = %s', (student_id,))
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Student not found'}), 404

        cursor.close()
        conn.close()
        return jsonify({'message': 'Student deleted successfully'}), 200
    except Error as e:
        print(f"Database error in delete_student: {e}")
        if e.errno == 1451:  # Foreign key constraint
            return jsonify({
                'error': 'Cannot delete student: it is referenced by grades',
                'details': str(e)
            }), 409
        return jsonify({
            'error': 'Failed to delete student',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in delete_student: {e}")
        return jsonify({
            'error': 'Failed to delete student',
            'details': str(e)
        }), 500

# ==================== GRADES CRUD ====================


@app.route('/api/grades', methods=['GET'])
def get_grades():
    """Get all grades"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT 
                g.grade_id AS id,
                g.student_id AS studentId,
                s.full_name AS studentName,
                g.subject_id AS subjectId,
                sub.subject_name AS subjectName,
                g.score,
                g.exam_date AS examDate
            FROM grades g
            LEFT JOIN students s ON g.student_id = s.student_id
            LEFT JOIN subjects sub ON g.subject_id = sub.subject_id
            ORDER BY g.grade_id ASC
        ''')
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)
    except Error as e:
        print(f"Database error in get_grades: {e}")
        return jsonify({
            'error': 'Failed to read grades from database',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in get_grades: {e}")
        return jsonify({
            'error': 'Failed to read grades from database',
            'details': str(e)
        }), 500


@app.route('/api/grades', methods=['POST'])
def create_grade():
    """Create a new grade"""
    try:
        data = request.get_json()
        if not data or 'studentId' not in data or 'subjectId' not in data or 'score' not in data:
            return jsonify({
                'error': 'Missing required fields: studentId, subjectId, score'
            }), 400

        score = float(data['score'])
        if score < 0 or score > 10:
            return jsonify({
                'error': 'Score must be between 0 and 10'
            }), 400

        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            INSERT INTO grades (student_id, subject_id, score, exam_date)
            VALUES (%s, %s, %s, %s)
        ''', (
            data['studentId'],
            data['subjectId'],
            score,
            data.get('examDate')
        ))
        conn.commit()
        grade_id = cursor.lastrowid
        cursor.execute('''
            SELECT 
                g.grade_id AS id,
                g.student_id AS studentId,
                s.full_name AS studentName,
                g.subject_id AS subjectId,
                sub.subject_name AS subjectName,
                g.score,
                g.exam_date AS examDate
            FROM grades g
            LEFT JOIN students s ON g.student_id = s.student_id
            LEFT JOIN subjects sub ON g.subject_id = sub.subject_id
            WHERE g.grade_id = %s
        ''', (grade_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result), 201
    except Error as e:
        print(f"Database error in create_grade: {e}")
        if e.errno == 1452:  # Foreign key constraint
            return jsonify({
                'error': 'Invalid student_id or subject_id',
                'details': str(e)
            }), 400
        return jsonify({
            'error': 'Failed to create grade',
            'details': str(e)
        }), 500
    except ValueError:
        return jsonify({
            'error': 'Invalid score format'
        }), 400
    except Exception as e:
        print(f"Unexpected error in create_grade: {e}")
        return jsonify({
            'error': 'Failed to create grade',
            'details': str(e)
        }), 500


@app.route('/api/grades/<int:grade_id>', methods=['GET'])
def get_grade(grade_id):
    """Get a grade by ID"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT 
                g.grade_id AS id,
                g.student_id AS studentId,
                s.full_name AS studentName,
                g.subject_id AS subjectId,
                sub.subject_name AS subjectName,
                g.score,
                g.exam_date AS examDate
            FROM grades g
            LEFT JOIN students s ON g.student_id = s.student_id
            LEFT JOIN subjects sub ON g.subject_id = sub.subject_id
            WHERE g.grade_id = %s
        ''', (grade_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if not result:
            return jsonify({'error': 'Grade not found'}), 404
        return jsonify(result)
    except Error as e:
        print(f"Database error in get_grade: {e}")
        return jsonify({
            'error': 'Failed to read grade from database',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in get_grade: {e}")
        return jsonify({
            'error': 'Failed to read grade from database',
            'details': str(e)
        }), 500


@app.route('/api/grades/<int:grade_id>', methods=['PUT'])
def update_grade(grade_id):
    """Update a grade"""
    try:
        data = request.get_json()
        if 'score' in data:
            score = float(data['score'])
            if score < 0 or score > 10:
                return jsonify({
                    'error': 'Score must be between 0 and 10'
                }), 400

        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)

        # Build update query dynamically
        updates = []
        params = []
        if 'studentId' in data:
            updates.append('student_id = %s')
            params.append(data['studentId'])
        if 'subjectId' in data:
            updates.append('subject_id = %s')
            params.append(data['subjectId'])
        if 'score' in data:
            updates.append('score = %s')
            params.append(float(data['score']))
        if 'examDate' in data:
            updates.append('exam_date = %s')
            params.append(data['examDate'])

        if not updates:
            cursor.close()
            conn.close()
            return jsonify({'error': 'No fields to update'}), 400

        params.append(grade_id)
        query = f'UPDATE grades SET {", ".join(updates)} WHERE grade_id = %s'
        cursor.execute(query, params)
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Grade not found'}), 404

        cursor.execute('''
            SELECT 
                g.grade_id AS id,
                g.student_id AS studentId,
                s.full_name AS studentName,
                g.subject_id AS subjectId,
                sub.subject_name AS subjectName,
                g.score,
                g.exam_date AS examDate
            FROM grades g
            LEFT JOIN students s ON g.student_id = s.student_id
            LEFT JOIN subjects sub ON g.subject_id = sub.subject_id
            WHERE g.grade_id = %s
        ''', (grade_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify(result)
    except Error as e:
        print(f"Database error in update_grade: {e}")
        if e.errno == 1452:  # Foreign key constraint
            return jsonify({
                'error': 'Invalid student_id or subject_id',
                'details': str(e)
            }), 400
        return jsonify({
            'error': 'Failed to update grade',
            'details': str(e)
        }), 500
    except ValueError:
        return jsonify({
            'error': 'Invalid score format'
        }), 400
    except Exception as e:
        print(f"Unexpected error in update_grade: {e}")
        return jsonify({
            'error': 'Failed to update grade',
            'details': str(e)
        }), 500


@app.route('/api/grades/<int:grade_id>', methods=['DELETE'])
def delete_grade(grade_id):
    """Delete a grade"""
    try:
        pool = get_pool()
        conn = pool.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM grades WHERE grade_id = %s', (grade_id,))
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Grade not found'}), 404

        cursor.close()
        conn.close()
        return jsonify({'message': 'Grade deleted successfully'}), 200
    except Error as e:
        print(f"Database error in delete_grade: {e}")
        return jsonify({
            'error': 'Failed to delete grade',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"Unexpected error in delete_grade: {e}")
        return jsonify({
            'error': 'Failed to delete grade',
            'details': str(e)
        }), 500

# Protected route


@app.route('/secure', methods=['GET'])
@jwt_required
def secure():
    user = request.auth

    if not user:
        return jsonify({'error': 'Missing auth payload'}), 500

    return jsonify({
        'message': 'Secure resource OK',
        'preferred_username': user.get('preferred_username'),
        'email': user.get('email'),
        'sub': user.get('sub'),
        'iss': user.get('iss'),
        'aud': user.get('aud')
    })

# Swagger UI route


@app.route('/api-docs')
def swagger_ui():
    """Serve Swagger UI"""
    try:
        openapi_path = os.path.join(os.path.dirname(__file__), 'openapi.json')
        with open(openapi_path, 'r', encoding='utf-8') as f:
            openapi_spec = json.load(f)

        # Return HTML with Swagger UI
        swagger_html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>MiniCloud API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html {{
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }}
        *, *:before, *:after {{
            box-sizing: inherit;
        }}
        body {{
            margin:0;
            background: #fafafa;
        }}
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {{
            const ui = SwaggerUIBundle({{
                url: '/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                oauth2RedirectUrl: window.location.origin + '/api-docs/oauth2-redirect.html',
                onComplete: function() {{
                    console.log("Swagger UI loaded");
                }},
                initOAuth: {{
                    clientId: 'backend',
                    realm: 'master',
                    appName: 'MiniCloud API',
                    usePkceWithAuthorizationCodeGrant: true,
                    scopeSeparator: ' ',
                    additionalQueryStringParams: {{}}
                }},
                requestInterceptor: function(request) {{
                    console.log("Request:", request);
                    return request;
                }},
                responseInterceptor: function(response) {{
                    console.log("Response:", response);
                    return response;
                }}
            }})
        }}
    </script>
</body>
</html>
        """
        return swagger_html
    except Exception as e:
        return jsonify({'error': 'Failed to load Swagger UI', 'details': str(e)}), 500


@app.route('/openapi.json')
def openapi_json():
    """Serve OpenAPI spec"""
    try:
        openapi_path = os.path.join(os.path.dirname(__file__), 'openapi.json')
        with open(openapi_path, 'r', encoding='utf-8') as f:
            openapi_spec = json.load(f)
        return jsonify(openapi_spec)
    except Exception as e:
        return jsonify({'error': 'Failed to load OpenAPI spec', 'details': str(e)}), 500


@app.route('/api-docs/oauth2-redirect.html')
@app.route('/oauth2-redirect.html')
def oauth2_redirect():
    """OAuth2 redirect page for Swagger UI"""
    html_content = """<!doctype html>
<html>
<head>
    <title>OAuth2 Redirect</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: #f5f5f5;
        }
        .message {
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: 0 auto;
        }
        .success {
            color: #4CAF50;
        }
        .error {
            color: #f44336;
        }
    </style>
</head>
<body>
    <div class="message">
        <p id="status">Processing authorization...</p>
    </div>
    <script>
        (function() {
            'use strict';
            function run() {
                try {
                    if (!window.opener) {
                        document.getElementById('status').innerHTML = '<span class="error">Error: Cannot access parent window. Please close this window and try again.</span>';
                        return;
                    }

                    var oauth2 = window.opener.swaggerUIRedirectOauth2;
                    if (!oauth2) {
                        document.getElementById('status').innerHTML = '<span class="error">Error: Swagger UI not found. Please close this window and try again.</span>';
                        setTimeout(function() { window.close(); }, 3000);
                        return;
                    }

                    var sentState = oauth2.state;
                    var redirectUrl = oauth2.redirectUrl;
                    var isValid, qp, arr;

                    if (window.location.hash && /code|error|state/.test(window.location.hash)) {
                        qp = window.location.hash.substring(1).split('&');
                    } else if (window.location.search) {
                        qp = window.location.search.substring(1).split('&');
                    } else {
                        document.getElementById('status').innerHTML = '<span class="error">Error: No authorization code received.</span>';
                        setTimeout(function() { window.close(); }, 3000);
                        return;
                    }

                    arr = qp.reduce(function (accum, item) {
                        var parts = item.split('=');
                        if (parts.length === 2) {
                            var key = parts[0];
                            var value = decodeURIComponent(parts[1]);
                            if (key === 'state') {
                                accum.state = value;
                            }
                            if (key === 'code') {
                                accum.code = value;
                            }
                            if (key === 'error') {
                                accum.error = value;
                            }
                            if (key === 'error_description') {
                                accum.error_description = value;
                            }
                        }
                        return accum;
                    }, {});

                    isValid = sentState === arr.state;

                    if (arr.error) {
                        var errorMsg = arr.error;
                        if (arr.error_description) {
                            errorMsg += ': ' + arr.error_description;
                        }
                        oauth2.errCb({
                            authId: oauth2.auth.name,
                            source: 'auth',
                            level: 'error',
                            message: errorMsg
                        });
                        document.getElementById('status').innerHTML = '<span class="error">Authorization failed: ' + errorMsg + '</span>';
                        setTimeout(function() { window.close(); }, 3000);
                        return;
                    }

                    if (!isValid && arr.state) {
                        oauth2.errCb({
                            authId: oauth2.auth.name,
                            source: 'auth',
                            level: 'warning',
                            message: 'Authorization may be unsafe, passed state was changed in server.'
                        });
                    }

                    if ((oauth2.auth.schema.get('flow') === 'accessCode' ||
                         oauth2.auth.schema.get('flow') === 'authorizationCode' ||
                         oauth2.auth.schema.get('usePkceWithAuthorizationCodeGrant') === true) && !oauth2.auth.code) {
                        if (arr.code) {
                            oauth2.auth.code = arr.code;
                            oauth2.callback({auth: oauth2.auth, redirectUrl: redirectUrl});
                            document.getElementById('status').innerHTML = '<span class="success">Authorization successful! Closing window...</span>';
                            setTimeout(function() { window.close(); }, 1000);
                        } else {
                            document.getElementById('status').innerHTML = '<span class="error">Error: No authorization code found.</span>';
                            setTimeout(function() { window.close(); }, 3000);
                        }
                    } else {
                        oauth2.callback({auth: oauth2.auth, token: {access_token: arr.code}, isValid: isValid, redirectUrl: redirectUrl});
                        document.getElementById('status').innerHTML = '<span class="success">Authorization successful! Closing window...</span>';
                        setTimeout(function() { window.close(); }, 1000);
                    }
                } catch (e) {
                    console.error('OAuth2 redirect error:', e);
                    document.getElementById('status').innerHTML = '<span class="error">Error: ' + e.message + '</span>';
                    setTimeout(function() { window.close(); }, 3000);
                }
            }
            
            if (document.readyState === 'loading') {
                window.addEventListener('DOMContentLoaded', run);
            } else {
                run();
            }
        })();
    </script>
</body>
</html>"""
    return html_content


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=False)
