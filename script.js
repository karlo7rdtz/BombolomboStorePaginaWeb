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

            novedades: [
                { id: 1, nombre: 'Gorra 1', imagen: 'IMGWeb/gorra1.png', stock: 10 },
                { id: 2, nombre: 'Gorra 2', imagen: 'IMGWeb/gorra2.png', stock: 8 },
                { id: 3, nombre: 'Gorra 3', imagen: 'IMGWeb/gorra3.png', stock: 7 },
                { id: 4, nombre: 'Gorra 4', imagen: 'IMGWeb/gorra4.png', stock: 5 }
            ],
            indiceActual: 0
        }
    },
    methods: {
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
                this.mostrarLogin = false; // Oculta el login si ya hay sesión
            }
        }
    },
    mounted() {
        this.verificarSesion();

        if (this.novedades.length > 0) {
            setInterval(() => this.siguienteImagen(), 3000);
        }

        // Inyección dinámica para las otras páginas
        this.$nextTick(() => {
            const contenedorAcerca = document.getElementById('seccion-acerca');
            if (contenedorAcerca) {
                contenedorAcerca.innerHTML = `
                    <div class="contenido">
                        <h1>Acerca de nosotros</h1>
                        <h2>Bombolombo Store</h2>
                        <p>En Bombolombo Store creemos que vestir con estilo no debería ser un lujo. 
                        Somos una tienda en línea dedicada a ofrecer ropa de excelente calidad a precios accesibles.</p>
                        <p>Viste con estilo. Viste con confianza. Viste Bombolombo.</p>
                    </div>`;
            }

            const contenedorMision = document.getElementById('seccion-mision');
            if (contenedorMision) {
                contenedorMision.innerHTML = `
                    <h1 class="mb-4">Misión</h1>
                    <p class="mb-4" align="center">Ofrecer ropa de buena calidad a precios accesibles, permitiendo que las personas puedan vestir con estilo sin gastar cantidades exageradas.</p>
                    <a href="index.html" class="text-white fw-bold" style="text-decoration: none; border: 1px solid white; padding: 10px 20px; border-radius: 5px;">Regresar</a>`;
            }

            const contenedorVision = document.getElementById('seccion-vision');
            if (contenedorVision) {
                contenedorVision.innerHTML = `
                    <h1 class="mb-4">Visión</h1>
                    <p class="mb-4" align="center">Convertirnos en una marca reconocida a nivel mundial, destacando por nuestra calidad y consolidarnos en el mercado de moda urbana.</p>
                    <a href="index.html" class="text-white fw-bold" style="text-decoration: none; border: 1px solid white; padding: 10px 20px; border-radius: 5px;">Regresar</a>`;
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
                    <a href="https://jigsaw.w3.org/css-validator/check/referer">
                        <img style="border:0;width:88px;height:31px" src="https://jigsaw.w3.org/css-validator/images/vcss" alt="¡CSS Válido!">
                    </a>
                    <a href="https://jigsaw.w3.org/css-validator/check/referer">
                        <img style="border:0;width:88px;height:31px" src="https://jigsaw.w3.org/css-validator/images/vcss-blue" alt="¡CSS Válido!">
                    </a>
            </div>
        </div>
    </footer>`
});

// Montamos la aplicación Vue
app.mount('#app');

// 3. Lógica de Iniciar Sesión
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
});

// 4. Lógica de Registro (JustValidate + AJAX Completo)
setTimeout(() => {
    const regForm = document.getElementById('register-form');
    
    if (regForm) {
        const validation = new window.JustValidate('#register-form', {
            errorFieldCssClass: 'is-invalid'
        });

        validation
            .addField('#reg_user', [
                { rule: 'required', errorMessage: 'Completa este campo' },
                {
                    // AJAX: Validar Nombre de Usuario en tiempo real
                    validator: async (value) => {
                        if (!value) return true;
                        const response = await fetch(`http://localhost:5000/api/verificar-usuario?usuario=${value}`);
                        const data = await response.json();
                        return !data.existe; // Devuelve true si NO existe
                    },
                    errorMessage: '⚠️ El nombre de usuario ya está en uso'
                }
            ])
            .addField('#reg_phone', [
                { rule: 'required', errorMessage: 'Completa este campo' },
                { rule: 'customRegexp', value: /^[0-9]+$/, errorMessage: 'Usa solo números ⚠️' },
                {
                    // AJAX: Validar Teléfono en tiempo real
                    validator: async (value) => {
                        if (!value) return true;
                        const response = await fetch(`http://localhost:5000/api/verificar-telefono?telefono=${value}`);
                        const data = await response.json();
                        return !data.existe; // Devuelve true si NO existe
                    },
                    errorMessage: '⚠️ Este número de teléfono ya está registrado'
                }
            ])
            .addField('#reg_email', [
                { rule: 'required', errorMessage: 'Completa este campo' },
                { rule: 'customRegexp', value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/, errorMessage: 'Usa @gmail.com' },
                {
                    // AJAX: Validar Correo Electrónico en tiempo real
                    validator: async (value) => {
                        if (!value) return true;
                        const response = await fetch(`http://localhost:5000/api/verificar-email?email=${value}`);
                        const data = await response.json();
                        return !data.existe; // Devuelve true si NO existe
                    },
                    errorMessage: '⚠️ Este correo ya está registrado'
                }
            ])
            .addField('#reg_email_confirm', [
                { rule: 'required', errorMessage: 'Completa este campo' },
                { 
                    validator: (value, fields) => value === fields['#reg_email'].elem.value, 
                    errorMessage: 'Los correos no coinciden' 
                }
            ])
            .addField('#reg_pass', [
                { rule: 'required', errorMessage: 'Completa este campo' },
                { rule: 'minLength', value: 10, errorMessage: 'Mínimo 10 caracteres' }
            ])
            .addField('#reg_pass_confirm', [
                { rule: 'required', errorMessage: 'Completa este campo' },
                { 
                    validator: (value, fields) => value === fields['#reg_pass'].elem.value, 
                    errorMessage: 'Las contraseñas no coinciden' 
                }
            ])
            .onSuccess(async (event) => {
                event.preventDefault();
                
                // Recolección final de datos
                const datosUsuario = {
                    usuario: document.getElementById('reg_user').value,
                    telefono: document.getElementById('reg_phone').value,
                    correo: document.getElementById('reg_email').value,
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
                        // Limpia el formulario y recarga la página
                        document.getElementById('register-form').reset();
                        location.reload(); 
                    } else {
                        // Aquí se atrapa el error si el backend bloqueó el registro
                        alert('Error: ' + data.error);
                    }
                } catch (error) {
                    alert('Error de conexión con el servidor.');
                }
            });
    }
}, 500);