// 1. Función para mostrar/ocultar contraseña
function togglePass(id, el) {
    const input = document.getElementById(id);
    if (input) {
        if (input.type === "password") {
            input.type = "text";
            el.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = "password";
            el.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
}

// 2. Configuración Principal de Vue.js
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            mostrarLogin: true,
            usuarioLogueado: false,
            nombreUsuario: '',
            usuarioRol: '',

            // Lista de productos que vendrá de la base de datos
            productos: [],

            // Carrusel de novedades (puedes seguir usando estos estáticos o traerlos de la BD también)
            novedades: [
                { id: 1, nombre: 'Gorra 1', imagen: 'IMGWeb/gorra1.png', stock: 10 },
                { id: 2, nombre: 'Gorra 2', imagen: 'IMGWeb/gorra2.png', stock: 8 },
                { id: 3, nombre: 'Gorra 3', imagen: 'IMGWeb/gorra3.png', stock: 7 },
                { id: 4, nombre: 'Gorra 4', imagen: 'IMGWeb/gorra4.png', stock: 5 }
            ],
            indiceActual: 0,

            productos: [] // Aquí guardaremos la ropa de la base de datos
        }
    },
    computed: {
        // Agrupa automáticamente los productos por 'tipo_prenda' para el catálogo
        productosAgrupados() {
            return this.productos.reduce((groups, item) => {
                const tipo = item.tipo_prenda || 'Otros';
                if (!groups[tipo]) {
                    groups[tipo] = [];
                }
                groups[tipo].push(item);
                return groups;
            }, {});
        }
    },
    methods: {
        async cargarProductos() {
            try {
                const response = await fetch('http://localhost:5000/api/productos');
                if (response.ok) {
                    this.productos = await response.json();
                }
            } catch (error) {
                console.error("Error al cargar productos desde la base de datos:", error);
            }
        },
        siguienteImagen() {
            this.indiceActual = (this.indiceActual + 1) % this.novedades.length;
        },
        logout() {
            localStorage.clear();
            alert("Sesión cerrada con éxito");
            window.location.href = 'index.html';
        },
        verificarSesion() {
            const nombre = localStorage.getItem('nombreUsuario');
            const rol = localStorage.getItem('rolUsuario');
            if (nombre) {
                this.usuarioLogueado = true;
                this.nombreUsuario = nombre;
                this.usuarioRol = rol;
                this.mostrarLogin = false;
            }
        },
        async cargarProductos() {
            try {
                const res = await fetch('http://localhost:5000/api/productos');
                if (res.ok) {
                    this.productos = await res.json();
                }
            } catch (error) {
                console.error("Error cargando el catálogo:", error);
            }
        },
        filtrarPor(tipo) {
            // Filtramos usando tu columna exacta de la base de datos
            return this.productos.filter(p => p.tipo_prenda === tipo);
        }
    },
    mounted() {
        this.verificarSesion();

        this.cargarProductos(); // Cargamos los productos de la BD al iniciar


        if (this.novedades.length > 0) {
            setInterval(() => this.siguienteImagen(), 3000);
        }

        // Inyección dinámica para las secciones de texto
        this.$nextTick(() => {
            const textos = {
                'seccion-acerca': `
                    <div class="contenido">
                        <h1>Acerca de nosotros</h1>
                        <h2>Bombolombo Store</h2>
                        <p>En Bombolombo Store creemos que vestir con estilo no debería ser un lujo.</p>
                        <p>Viste con estilo. Viste con confianza. Viste Bombolombo.</p>
                    </div>`,
                'seccion-mision': `
                    <h1 class="mb-4">Misión</h1>
                    <p class="mb-4" align="center">Ofrecer ropa de buena calidad a precios accesibles para todos.</p>
                    <a href="index.html" class="text-white fw-bold" style="text-decoration: none; border: 1px solid white; padding: 10px 20px; border-radius: 5px;">Regresar</a>`,
                'seccion-vision': `
                    <h1 class="mb-4">Visión</h1>
                    <p class="mb-4" align="center">Convertirnos en una marca reconocida mundialmente en moda urbana.</p>
                    <a href="index.html" class="text-white fw-bold" style="text-decoration: none; border: 1px solid white; padding: 10px 20px; border-radius: 5px;">Regresar</a>`
            };

            for (const [id, html] of Object.entries(textos)) {
                const el = document.getElementById(id);
                if (el) el.innerHTML = html;
            }
        });
    }
});

// Componente Global: Footer
app.component('app-footer', {
    template: `
    <footer class="bg-custom-dark text-white text-center py-4 mt-auto">
        <div class="container">
            <p class="mb-1">Contacto: bombolombodudas@gmail.com | Horario: 9:00 - 16:00 MX</p>
            <p class="mb-3">© 2026 Bombolombo Store</p>
            <div class="d-flex justify-content-center gap-3">
                <a href="https://jigsaw.w3.org/css-validator/check/referer"><img style="border:0;width:88px;height:31px" src="https://jigsaw.w3.org/css-validator/images/vcss" alt="¡CSS Válido!"></a>
                <a href="https://jigsaw.w3.org/css-validator/check/referer"><img style="border:0;width:88px;height:31px" src="https://jigsaw.w3.org/css-validator/images/vcss-blue" alt="¡CSS Válido!"></a>
            </div>
        </div>
    </footer>`
});

app.mount('#app');

// 3. Lógica de Iniciar Sesión (Fetch)
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'login-form') {
        e.preventDefault();
        const datosLogin = {
            user_login: document.querySelector('input[name="user_login"]').value,
            pass_login: document.getElementById('pass_login').value
        };

        try {
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosLogin)
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('rolUsuario', data.rol);
                localStorage.setItem('nombreUsuario', data.nombre);
                window.location.href = 'catalogo.html';
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('No se pudo conectar con el servidor.');
        }
    }
    // NUEVO: Lógica para el formulario de Agregar Producto del Administrador
    if (e.target && e.target.id === 'form-agregar') {
        e.preventDefault();
        
        const nuevoProducto = {
            nombre: document.getElementById('add-nombre').value,
            cantidad_stock: document.getElementById('add-cantidad').value,
            precio: document.getElementById('add-precio').value,
            tipo_prenda: document.getElementById('add-tipo').value,
            descripcion: document.getElementById('add-descripcion').value,
            imagen_url: document.getElementById('add-imagen').value // Nuevo campo para la ruta
        };

        try {
            const res = await fetch('http://localhost:5000/api/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoProducto)
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.mensaje);
                document.getElementById('form-agregar').reset();
            } else {
                alert('Error al guardar: ' + data.error);
            }
        } catch (error) {
            alert('Error de conexión con el servidor.');
        }
    }
});

// 4. Lógica de Registro con JustValidate y AJAX
setTimeout(() => {
    const regForm = document.getElementById('register-form');
    if (regForm) {
        const validation = new window.JustValidate('#register-form', { errorFieldCssClass: 'is-invalid' });

        validation
            .addField('#reg_user', [
                { rule: 'required', errorMessage: 'Completa este campo' },
                {
                    validator: async (value) => {
                        if (!value) return true;
                        const res = await fetch(`http://localhost:5000/api/verificar-usuario?usuario=${value}`);
                        const data = await res.json();
                        return !data.existe;
                    },
                    errorMessage: '⚠️ Usuario en uso'
                }
            ])
            .addField('#reg_phone', [
                { rule: 'required', errorMessage: 'Completa este campo' },
                { rule: 'customRegexp', value: /^[0-9]+$/, errorMessage: 'Solo números ⚠️' },
                {
                    validator: async (value) => {
                        if (!value) return true;
                        const res = await fetch(`http://localhost:5000/api/verificar-telefono?telefono=${value}`);
                        const data = await res.json();
                        return !data.existe;
                    },
                    errorMessage: '⚠️ Teléfono ya registrado'
                }
            ])
            .addField('#reg_email', [
                { rule: 'required', errorMessage: 'Completa este campo' },
                { rule: 'customRegexp', value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/, errorMessage: 'Usa @gmail.com' },
                {
                    validator: async (value) => {
                        if (!value) return true;
                        const res = await fetch(`http://localhost:5000/api/verificar-email?email=${value}`);
                        const data = await res.json();
                        return !data.existe;
                    },
                    errorMessage: '⚠️ Correo ya registrado'
                }
            ])
            .addField('#reg_email_confirm', [{ rule: 'required' }, { validator: (v, f) => v === f['#reg_email'].elem.value, errorMessage: 'No coincide' }])
            .addField('#reg_pass', [{ rule: 'required' }, { rule: 'minLength', value: 10 }])
            .addField('#reg_pass_confirm', [{ rule: 'required' }, { validator: (v, f) => v === f['#reg_pass'].elem.value, errorMessage: 'No coincide' }])
            .onSuccess(async (event) => {
                const datosUsuario = {
                    nombre_usuario: document.getElementById('reg_user').value,
                    telefono: document.getElementById('reg_phone').value,
                    correo_electronico: document.getElementById('reg_email').value,
                    contrasena: document.getElementById('reg_pass').value
                };

                try {
                    const response = await fetch('http://localhost:5000/api/registro', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(datosUsuario)
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert(data.mensaje);
                        location.reload();
                    } else {
                        alert('Error: ' + data.error);
                    }
                } catch (error) {
                    alert('Error de conexión.');
                }
            });
    }
}, 500);