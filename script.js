
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

document.addEventListener('DOMContentLoaded', () => {

const contenedorAcerca = document.getElementById('seccion-acerca');

if (contenedorAcerca) {
    contenedorAcerca.innerHTML = `
        <div class="contenido">
            <h1>Acerca de nosotros</h1>
            <h2>Bombolombo Store</h2>
            <p>En Bombolombo Store creemos que vestir con estilo no debería ser un lujo<br>
               Somos una tienda en línea dedicada a ofrecer ropa de excelente calidad a precios accesibles,<br>
               pensada para quienes quieren verse bien, sentirse cómodos y expresar su personalidad sin gastar de más
            </p>
            <p>Cada prenda está seleccionada cuidadosamente para brindarte comodidad,<br>
               durabilidad y un diseño moderno que se adapta a tu día a día</p>
            <p>En Bombolombo Store, la moda es para todos<br>
               <strong>Viste con estilo</strong><br>
               <strong>Viste con confianza</strong><br>
               <strong>Viste Bombolombo</strong>
            </p>
        </div>
    `;
}

const contenedorMision = document.getElementById('seccion-mision');

if (contenedorMision) {
    contenedorMision.innerHTML = `
        <h1 class="mb-4">Misión</h1>
        <p class="mb-4" style="line-height: 1.6;" align="center">
            Tenemos como misión ofrecer ropa de buena calidad a precios accesibles,
            permitiendo que las personas puedan vestir con estilo, comodidad y confianza
            sin tener que gastar cantidades exageradas por un conjunto.
            En Bombolombo Store creemos que la moda debe estar al alcance de todos.
        </p>
        <a href="index.html" class="text-white fw-bold" style="text-decoration: none; border: 1px solid white; padding: 10px 20px; border-radius: 5px;">Regresar</a>
    `;
}

const contenedorVision = document.getElementById('seccion-vision');

if (contenedorVision) {
    contenedorVision.innerHTML = `
        <h1 class="mb-4">Visión</h1>
        <p class="mb-4" style="line-height: 1.6;" align="center">
            Tenemos como meta convertirnos en una marca reconocida a nivel mundial,
            destacando por nuestra calidad, accesibilidad y estilo,
            con el objetivo de establecer al menos una tienda física en cada ciudad importante y
            consolidarnos como una de las principales opciones en el mercado de moda urbana.
        </p>
        <a href="index.html" class="text-white fw-bold" style="text-decoration: none; border: 1px solid white; padding: 10px 20px; border-radius: 5px;">Regresar</a>
    `;
}

if (document.getElementById('app')) {
        const { createApp } = Vue;
        createApp({
            data() {
                return {
                    imagenes: ['IMGWeb/gorra1.png', 'IMGWeb/gorra2.png', 'IMGWeb/gorra3.png', 'IMGWeb/gorra4.png'],
                    indiceActual: 0
                }
            },
            mounted() { setInterval(() => { this.siguienteImagen(); }, 3000); },
            methods: { siguienteImagen() { this.indiceActual = (this.indiceActual + 1) % this.imagenes.length; } }
        }).mount('#app');
    }


const regForm = document.getElementById('register-form');
if (regForm) {
    const validation = new window.JustValidate('#register-form', {
        errorFieldCssClass: 'is-invalid',
        validateBeforeSubmitting: true, 
    });

    validation

        .addField('#reg_user', [
            { rule: 'required', errorMessage: 'Completa este campo' }
        ])

        .addField('#reg_phone', [
            { rule: 'required', errorMessage: 'Completa este campo' },
            {
                rule: 'customRegexp',
                value: /^[0-9]+$/,
                errorMessage: 'Favor de usar solo números ⚠️',
            },
        ])

        .addField('#reg_email', [
            { rule: 'required', errorMessage: 'Completa este campo' },
            {
                rule: 'customRegexp',
                value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                errorMessage: 'El correo debe terminar en @gmail.com',
            },
        ])

        .addField('#reg_email_confirm', [
            { rule: 'required', errorMessage: 'Completa este campo' },
            {
                validator: (value, fields) => value === fields['#reg_email'].elem.value,
                errorMessage: 'No coincide el correo',
            },
        ])

        .addField('#reg_pass', [
            { rule: 'required', errorMessage: 'Completa este campo' },
            { rule: 'minLength', value: 10, errorMessage: 'Mínimo 10 caracteres' },
            { rule: 'customRegexp', value: /[0-9]/, errorMessage: 'Falta un número' },
            { rule: 'customRegexp', value: /[!@#$%^&*]/, errorMessage: 'Falta un símbolo' },
        ])

        .addField('#reg_pass_confirm', [
            { rule: 'required', errorMessage: 'Completa este campo' },
            {
                validator: (value, fields) => value === fields['#reg_pass'].elem.value,
                errorMessage: 'No coincide la contraseña',
            },
        ])
        .onSuccess((event) => {
            alert('¡Cuenta creada con éxito!');
        });
}});