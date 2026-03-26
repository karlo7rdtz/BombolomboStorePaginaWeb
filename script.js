const { createApp } = Vue;

createApp({
    data() {
        return {
            // Lista de tus imágenes. 
            // Si están en una carpeta, recuerda poner 'ImgWeb/gorra1.png'
            imagenes: [
                'IMGWeb/gorra1.png',
                'IMGWeb/gorra2.png',
                'IMGWeb/gorra3.png',
                'IMGWeb/gorra4.png'
            ],
            indiceActual: 0
        }
    },
    mounted() {
        // Temporizador: cambia cada 3000ms (3 segundos)
        setInterval(() => {
            this.siguienteImagen();
        }, 3000);
    },
    methods: {
        siguienteImagen() {
            // Incrementa el índice y vuelve a 0 al llegar al final de la lista
            this.indiceActual = (this.indiceActual + 1) % this.imagenes.length;
        }
    }
}).mount('#app');