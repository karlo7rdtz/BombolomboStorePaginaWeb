from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# Permitir que el frontend se comunique con el backend
CORS(app)

# Configuración de la base de datos Neon
DATABASE_URL = "postgresql://neondb_owner:npg_oQ4BrhMS9WEi@ep-icy-bonus-ap3ijfeu-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error de conexión a Neon: {e}")
        return None

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
        # Verificar si alguno de los datos ya existe antes de insertar
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

        # Si no hay duplicados, cifrar contraseña y guardar
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

# --- RUTAS DE VERIFICACIÓN AJAX (USADAS POR JUSTVALIDATE) ---

@app.route('/api/verificar-usuario', methods=['GET'])
def verificar_usuario():
    usuario_a_revisar = request.args.get('usuario')
    if not usuario_a_revisar:
        return jsonify({"existe": False}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM usuarios WHERE nombre_usuario = %s", (usuario_a_revisar,))
        existe = cur.fetchone() is not None
        return jsonify({"existe": existe}), 200
    finally:
        cur.close()
        conn.close()

@app.route('/api/verificar-telefono', methods=['GET'])
def verificar_telefono():
    telefono_a_revisar = request.args.get('telefono')
    if not telefono_a_revisar:
        return jsonify({"existe": False}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM usuarios WHERE telefono = %s", (telefono_a_revisar,))
        existe = cur.fetchone() is not None
        return jsonify({"existe": existe}), 200
    finally:
        cur.close()
        conn.close()

@app.route('/api/verificar-email', methods=['GET'])
def verificar_email():
    email_a_revisar = request.args.get('email')
    if not email_a_revisar:
        return jsonify({"existe": False}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM usuarios WHERE correo_electronico = %s", (email_a_revisar,))
        existe = cur.fetchone() is not None
        return jsonify({"existe": existe}), 200
    finally:
        cur.close()
        conn.close()


@app.route('/api/productos', methods=['GET'])
def listar_productos():
    conn = get_db_connection()
    cur = conn.cursor()
    # Usamos tus nombres de columna exactos
    cur.execute("""
        SELECT id_producto, nombre, tipo_prenda, precio, cantidad_stock, imagen_url 
        FROM productos 
        ORDER BY tipo_prenda ASC
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
            "imagen_url": r[5]
        })
    
    cur.close()
    conn.close()
    return jsonify(lista)


# --- RUTA PARA OBTENER TODOS LOS PRODUCTOS (Para el Catálogo) ---
@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    conn = get_db_connection()
    if conn is None: return jsonify({"error": "BD desconectada"}), 500
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM productos ORDER BY id_producto DESC")
        columnas = [desc[0] for desc in cur.description]
        productos = [dict(zip(columnas, fila)) for fila in cur.fetchall()]
        return jsonify(productos), 200
    finally:
        cur.close()
        conn.close()

# --- RUTA PARA AGREGAR PRODUCTOS (Para el Administrador) ---
@app.route('/api/productos', methods=['POST'])
def agregar_producto():
    data = request.json
    conn = get_db_connection()
    if conn is None: return jsonify({"error": "BD desconectada"}), 500
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO productos (nombre, descripcion, tipo_prenda, precio, cantidad_stock, imagen_url)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (data['nombre'], data['descripcion'], data['tipo_prenda'], 
              data['precio'], data['cantidad_stock'], data['imagen_url']))
        conn.commit()
        return jsonify({"mensaje": "Producto guardado con éxito en el catálogo"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()
        

if __name__ == '__main__':
    app.run(debug=True, port=5000)