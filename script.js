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
                this.mostrarLogin = false;
            }
        }
    },
    mounted() {
        this.verificarSesion();

        if (this.novedades.length > 0) {
            setInterval(() => this.siguienteImagen(), 3000);
        }

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

app.mount('#app');

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

document.addEventListener('DOMContentLoaded', () => {
    const inputEmail = document.getElementById('reg_email');
    if (inputEmail) {
        let timeout = null;
        inputEmail.addEventListener('input', function () {
            const email = this.value;
            const feedback = document.getElementById('email-feedback');
            clearTimeout(timeout);
            if (email === "") {
                feedback.style.display = 'none';
                return;
            }
            timeout = setTimeout(async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/verificar-email?email=${email}`);
                    const data = await response.json();
                    if (data.existe) {
                        feedback.textContent = "⚠️ Este correo ya está en uso";
                        feedback.style.display = 'block';
                        inputEmail.style.borderColor = '#ff4d4d';
                    } else {
                        feedback.style.display = 'none';
                        inputEmail.style.borderColor = '#04AA6D';
                    }
                } catch (error) { console.error(error); }
            }, 500);
        });
    }
});