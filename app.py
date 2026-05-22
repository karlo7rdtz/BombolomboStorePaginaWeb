from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash
import os 
from werkzeug.utils import secure_filename 

app = Flask(__name__)
# Permitir que el frontend se comunique con el backend
CORS(app)

DATABASE_URL = os.environ.get(
    'DATABASE_URL', 
    "postgresql://neondb_owner:npg_oQ4BrhMS9WEi@ep-icy-bonus-ap3ijfeu-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
)

# --- CONFIGURACIÓN DE CARPETA DE FOTOS OPTIMIZADA PARA LINUX (AZURE) ---
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'ImgWeb')

# Azure nos permite escribir en el disco, creamos la carpeta de forma absoluta y directa
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error de conexión a Neon: {e}")
        return None

# --- RUTA PARA SERVIR LAS IMÁGENES AL FRONTEND DESDE AZURE ---
@app.route('/ImgWeb/<filename>', methods=['GET'])
def web_images(filename):
    """Permite que el navegador acceda a las imágenes guardadas en el disco de Azure"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- RUTA DE REGISTRO CON BLOQUEO DE DUPLICADOS ---
@app.route('/api/registro', methods=['POST'])
def registro():
    data = request.json
    usuario = data.get('usuario')
    telefono = data.get('telefono')
    correo = data.get('correo')
    contrasena = data.get('contrasena')

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Base de datos desconectada."}), 500
    
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT nombre_usuario, correo_electronico, telefono 
            FROM usuarios 
            WHERE nombre_usuario = %s OR correo_electronico = %s OR telefono = %s
        """, (usuario, correo, telefono))
        
        duplicado = cur.fetchone()

        if duplicado:
            if duplicado[0] == usuario:
                return jsonify({"error": "El nombre de usuario ya está en uso."}), 400
            if duplicado[1] == correo:
                return jsonify({"error": "El correo ya está registrado."}), 400
            if duplicado[2] == telefono:
                return jsonify({"error": "Este número de teléfono ya está registrado."}), 400

        hashed_password = generate_password_hash(contrasena)
        cur.execute(
            "INSERT INTO usuarios (nombre_usuario, telefono, correo_electronico, contrasena) VALUES (%s, %s, %s, %s)",
            (usuario, telefono, correo, hashed_password)
        )
        conn.commit()
        return jsonify({"mensaje": "¡Cuenta creada en Bombolombo Store con éxito!"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

# --- RUTA DE LOGIN ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    correo = data.get('user_login') 
    contrasena = data.get('pass_login')

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Base de datos desconectada."}), 500
    
    cur = conn.cursor()
    try:
        cur.execute("SELECT nombre_usuario, contrasena, rol FROM usuarios WHERE correo_electronico = %s", (correo,))
        usuario = cur.fetchone()

        if usuario and check_password_hash(usuario[1], contrasena):
            return jsonify({
                "mensaje": f"¡Bienvenido, {usuario[0]}!",
                "rol": usuario[2],
                "nombre": usuario[0]
            }), 200
        else:
            return jsonify({"error": "Correo o contraseña incorrectos."}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

# --- RUTAS DE VERIFICACIÓN AJAX ---
@app.route('/api/verificar-usuario', methods=['GET'])
def verificar_usuario():
    usuario_a_revisar = request.args.get('usuario')
    if not usuario_a_revisar: return jsonify({"existe": False}), 400
    conn = get_db_connection()
    if conn is None: return jsonify({"error": "Base de datos desconectada."}), 500
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM usuarios WHERE nombre_usuario = %s", (usuario_a_revisar,))
        return jsonify({"existe": cur.fetchone() is not None}), 200
    finally:
        cur.close()
        conn.close()

@app.route('/api/verificar-telefono', methods=['GET'])
def verificar_telefono():
    telefono_a_revisar = request.args.get('telefono')
    if not telefono_a_revisar: return jsonify({"existe": False}), 400
    conn = get_db_connection()
    if conn is None: return jsonify({"error": "Base de datos desconectada."}), 500
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM usuarios WHERE telefono = %s", (telefono_a_revisar,))
        return jsonify({"existe": cur.fetchone() is not None}), 200
    finally:
        cur.close()
        conn.close()

@app.route('/api/verificar-email', methods=['GET'])
def verificar_email():
    email_a_revisar = request.args.get('email')
    if not email_a_revisar: return jsonify({"existe": False}), 400
    conn = get_db_connection()
    if conn is None: return jsonify({"error": "Base de datos desconectada."}), 500
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM usuarios WHERE correo_electronico = %s", (email_a_revisar,))
        return jsonify({"existe": cur.fetchone() is not None}), 200
    finally:
        cur.close()
        conn.close()

# --- RUTAS DE PRODUCTOS ---
@app.route('/api/productos', methods=['GET'])
def listar_productos():
    conn = get_db_connection()
    if conn is None: return jsonify({"error": "Base de datos desconectada."}), 500
    cur = conn.cursor()
    cur.execute("""
        SELECT id_producto, nombre, tipo_prenda, precio, cantidad_stock, imagen_url, descripcion 
        FROM productos 
        ORDER BY id_producto DESC
    """)
    rows = cur.fetchall()
    
    lista = []
    for r in rows:
        lista.append({
            "id_producto": r[0],
            "nombre": r[1],
            "tipo_prenda": r[2],
            "precio": float(r[3]),
            "cantidad_stock": r[4],
            "imagen_url": r[5],
            "descripcion": r[6]
        })
    cur.close()
    conn.close()
    return jsonify(lista)

@app.route('/api/productos', methods=['POST'])
def agregar_producto():
    nombre = request.form.get('nombre')
    cantidad_stock = request.form.get('cantidad_stock')
    precio = request.form.get('precio')
    tipo_prenda = request.form.get('tipo_prenda')
    descripcion = request.form.get('descripcion')
    
    if 'imagen' not in request.files:
        return jsonify({"error": "No se seleccionó ninguna imagen."}), 400
        
    file = request.files['imagen']
    if file.filename == '':
        return jsonify({"error": "El archivo de imagen está vacío."}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Guardamos la ruta relativa estándar para la URL del navegador
        imagen_url = f"ImgWeb/{filename}"

        conn = get_db_connection()
        if conn is None: return jsonify({"error": "Base de datos desconectada."}), 500
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO productos (nombre, cantidad_stock, precio, tipo_prenda, imagen_url, descripcion)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (nombre, cantidad_stock, precio, tipo_prenda, imagen_url, descripcion))
            conn.commit()
            return jsonify({"mensaje": "¡Producto guardado exitosamente con su imagen!"}), 201
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 400
        finally:
            cur.close()
            conn.close()

@app.route('/api/productos/<int:id>', methods=['PATCH'])
def actualizar_producto(id):
    datos = request.get_json()
    conn = get_db_connection()
    if conn is None: return jsonify({"error": "Base de datos desconectada."}), 500
    cur = conn.cursor()
    cur.execute("""
        UPDATE productos 
        SET cantidad_stock = %s, descripcion = %s 
        WHERE id_producto = %s
    """, (datos['cantidad'], datos['descripcion'], id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"mensaje": "¡Stock actualizado!"})

# --- RUTA PARA ELIMINAR (CON BORRADO DE IMAGEN FÍSICA) ---
@app.route('/api/productos/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    conn = get_db_connection()
    if conn is None: 
        return jsonify({"error": "Base de datos desconectada"}), 500
        
    cur = conn.cursor()
    try:
        # 1. Buscar el nombre de la imagen antes de borrar el registro
        cur.execute("SELECT imagen_url FROM productos WHERE id_producto = %s", (id,))
        producto = cur.fetchone()

        if producto and producto[0]:
            # Extraer el nombre del archivo de la ruta guardada
            filename = producto[0].split('/')[-1]
            imagen_ruta = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # 2. Borrar el archivo físico del disco de Azure si existe
            if os.path.exists(imagen_ruta):
                os.remove(imagen_ruta)

        # 3. Borrar el registro de la base de datos Neon
        cur.execute("DELETE FROM productos WHERE id_producto = %s", (id,))
        conn.commit()
        
        return jsonify({"mensaje": "Producto y su imagen fueron eliminados con éxito"})
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    # Localmente corre en el puerto 5000 con modo debug
    app.run(debug=True, port=5000)