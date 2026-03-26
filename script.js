const { createApp } = Vue;

createApp({
    data() {
        return {
              
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
        
        setInterval(() => {
            this.siguienteImagen();
        }, 3000);
    },
    methods: {
        siguienteImagen() {
            
            this.indiceActual = (this.indiceActual + 1) % this.imagenes.length;
        }
    }
}).mount('#app');