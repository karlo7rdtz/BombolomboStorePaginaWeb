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
            productos: [],
            novedades: [
                { id: 1, nombre: 'Gorra 1', imagen: 'IMGWeb/gorra1.png', stock: 10 },
                { id: 2, nombre: 'Gorra 2', imagen: 'IMGWeb/gorra2.png', stock: 8 },
                { id: 3, nombre: 'Gorra 3', imagen: 'IMGWeb/gorra3.png', stock: 7 },
                { id: 4, nombre: 'Gorra 4', imagen: 'IMGWeb/gorra4.png', stock: 5 }
            ],
            indiceActual: 0
        }
    },
    computed: {
        productosAgrupados() {
            return this.productos.reduce((groups, item) => {
                const tipo = item.tipo_prenda || 'Otros';
                if (!groups[tipo]) { groups[tipo] = []; }
                groups[tipo].push(item);
                return groups;
            }, {});
        }
    },
    methods: {
        async cargarProductos() {
            try {
                // CORRECCIÓN: Ruta relativa para buscar productos en Vercel
                const response = await fetch('/api/productos');
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
        filtrarPor(tipo) {
            return this.productos.filter(p => p.tipo_prenda === tipo);
        }
    },
    mounted() {
        this.verificarSesion();
        this.cargarProductos(); 

        if (this.novedades.length > 0) {
            setInterval(() => this.siguienteImagen(), 3000);
        }

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

app.component('app-footer', {
    template: `
    <footer class="bg-custom-dark text-white text-center py-4 mt-auto">
        <div class="container">
            <p class="mb-1">Contacto: bombolombodudas@gmail.com | Horario: 9:00 - 16:00 MX</p>
            <p class="mb-3">© 2026 Bombolombo Store</p>
        </div>
    </footer>`
});

app.mount('#app');

// 3. Login y Submit de productos
document.addEventListener('submit', async (e) => {
    
    if (e.target && e.target.id === 'login-form') {
        e.preventDefault();
        const datosLogin = {
            user_login: document.querySelector('input[name="user_login"]').value,
            pass_login: document.getElementById('pass_login').value
        };

        try {
            // CORRECCIÓN: Ruta relativa para el login
            const res = await fetch('/api/login', {
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
    
    // Agregar Producto (Con soporte para subir imágenes)
    if (e.target && e.target.id === 'form-agregar') {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('nombre', document.getElementById('add-nombre').value);
        formData.append('cantidad_stock', document.getElementById('add-cantidad').value);
        formData.append('precio', document.getElementById('add-precio').value);
        formData.append('tipo_prenda', document.getElementById('add-tipo').value);
        formData.append('descripcion', document.getElementById('add-descripcion').value);
        
        const fileInput = document.getElementById('add-imagen');
        if (fileInput.files.length > 0) {
            formData.append('imagen', fileInput.files[0]);
        }

        try {
            // CORRECCIÓN: Ruta relativa para agregar productos
            const res = await fetch('/api/productos', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.mensaje);
                document.getElementById('form-agregar').reset();
            } else {
                alert('Error al guardar: ' + data.error);
            }
        } catch (error) {
            alert('Error de conexión.');
        }
    }
});

// 4. Registro AJAX
setTimeout(() => {
    const regForm = document.getElementById('register-form');
    if (regForm) {
        const validation = new window.JustValidate('#register-form', { errorFieldCssClass: 'is-invalid', validateBeforeSubmitting: true });

        validation
            .addField('#reg_user', [{ rule: 'required' }, {
                validator: async (value) => {
                    if (!value) return true;
                    // CORRECCIÓN: Ruta relativa para verificar usuario
                    const res = await fetch(`/api/verificar-usuario?usuario=${value}`);
                    const data = await res.json();
                    return !data.existe;
                }, errorMessage: '⚠️ Usuario en uso'
            }])
            .addField('#reg_phone', [{ rule: 'required' }, { rule: 'customRegexp', value: /^[0-9]+$/ }, {
                validator: async (value) => {
                    if (!value) return true;
                    // CORRECCIÓN: Ruta relativa para verificar teléfono
                    const res = await fetch(`/api/verificar-telefono?telefono=${value}`);
                    const data = await res.json();
                    return !data.existe;
                }, errorMessage: '⚠️ Teléfono registrado'
            }])
            .addField('#reg_email', [{ rule: 'required' }, { rule: 'customRegexp', value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/ }, {
                validator: async (value) => {
                    if (!value) return true;
                    // CORRECCIÓN: Ruta relativa para verificar email
                    const res = await fetch(`/api/verificar-email?email=${value}`);
                    const data = await res.json();
                    return !data.existe;
                }, errorMessage: '⚠️ Correo registrado'
            }])
            .addField('#reg_email_confirm', [{ rule: 'required' }, { validator: (v, f) => v === f['#reg_email'].elem.value, errorMessage: 'No coincide' }])
            .addField('#reg_pass', [{ rule: 'required' }, { rule: 'minLength', value: 10 }])
            .addField('#reg_pass_confirm', [{ rule: 'required' }, { validator: (v, f) => v === f['#reg_pass'].elem.value, errorMessage: 'No coincide' }])
            .onSuccess(async (event) => {
                const datosUsuario = {
                    usuario: document.getElementById('reg_user').value,
                    telefono: document.getElementById('reg_phone').value,
                    correo: document.getElementById('reg_email').value,
                    contrasena: document.getElementById('reg_pass').value
                };
                try {
                    // CORRECCIÓN: Ruta relativa para procesar el registro
                    const response = await fetch('/api/registro', {
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

// Resto de Admin panel
// CORRECCIÓN: El API_URL global ahora usa ruta relativa
const API_URL = '/api/productos';

const manejarRespuesta = async (res, form) => {
    if (res.ok) {
        alert("Operación realizada con éxito");
        if (form) form.reset();
    } else {
        const errorData = await res.json();
        alert("Error: " + (errorData.error || "Error en el servidor"));
    }
};

const formActualizar = document.getElementById('form-actualizar');
if (formActualizar) {
    formActualizar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('upd-id').value;
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cantidad: document.getElementById('upd-cantidad').value,
                    descripcion: document.getElementById('upd-descripcion').value
                })
            });
            manejarRespuesta(res, e.target);
        } catch (error) {
            console.error("Error:", error);
        }
    });
}

const formEliminar = document.getElementById('form-eliminar');
if (formEliminar) {
    formEliminar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('del-id').value;
        if (!confirm('¿Seguro que quieres borrarlo?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            manejarRespuesta(res, e.target);
        } catch (error) {
            console.error("Error:", error);
        }
    });
}