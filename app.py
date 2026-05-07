from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from werkzeug.security import generate_password_hash

app = Flask(__name__)
# Esto es vital: permite que tu Live Server (puerto 5500) hable con Flask (puerto 5000)
CORS(app)

# Tu enlace exacto de Neon
DATABASE_URL = "postgresql://neondb_owner:npg_oQ4BrhMS9WEi@ep-icy-bonus-ap3ijfeu-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error de conexión a Neon: {e}")
        return None

@app.route('/api/registro', methods=['POST'])
def registro():
    data = request.json
    usuario = data.get('usuario')
    telefono = data.get('telefono')
    correo = data.get('correo')
    contrasena = data.get('contrasena')

    # Ciframos la contraseña
    hashed_password = generate_password_hash(contrasena)

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Base de datos desconectada."}), 500
    
    cur = conn.cursor()
    try:
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

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    correo = data.get('user_login') # Usamos el name que tienes en tu HTML
    contrasena = data.get('pass_login')

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Base de datos desconectada."}), 500
    
    cur = conn.cursor()
    try:
        # Buscamos al usuario por su correo
        cur.execute("SELECT nombre_usuario, contrasena, rol FROM usuarios WHERE correo_electronico = %s", (correo,))
        usuario = cur.fetchone()

        # Verificamos que exista y que la contraseña coincida
        if usuario and check_password_hash(usuario[1], contrasena):
            return jsonify({
                "mensaje": f"¡Bienvenido, {usuario[0]}!",
                "rol": usuario[2]
            }), 200
        else:
            return jsonify({"error": "Correo o contraseña incorrectos."}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    # Arranca el servidor backend en el puerto 5000
    app.run(debug=True, port=5000)