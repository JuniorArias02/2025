# Tu Línea del Tiempo Romántica ❤️

¡Todo está listo! Aquí tienes cómo usar tu nueva web.

## 📸 Cómo añadir tus fotos
1.  Abre la carpeta `public/memories` en este proyecto.
2.  Pega ahí todas tus fotos y videos (`.jpg`, `.png`, `.mp4`, etc.).
3.  Abre una terminal en esta carpeta y ejecuta:
    ```bash
    npm run scan
    ```
    *(Esto actualizará la lista de fotos automáticamente).*

## 🚀 Cómo ver la web en tu PC
1.  Para verla mientras editas:
    ```bash
    npm run dev
    ```
2.  Abre el link que te muestra (usualmente `http://localhost:5173`).

## 🌐 Cómo subirla a Internet (Gratis)
Recomiendo usar **Vercel** o **Netlify**. Son gratuitos y muy rápidos.

### Opción A: Vercel (Recomendada)
1.  Instala Vercel CLI: `npm i -g vercel` (o usa su web importando desde GitHub).
2.  En la terminal de este proyecto, escribe:
    ```bash
    vercel
    ```
3.  Dale a "Enter" a todo. ¡Listo! Te dará un link `.vercel.app` para compartir.

### Opción B: Hosting Tradicional (cPanel / FTP)
1.  Genera los archivos finales:
    ```bash
    npm run build
    ```
2.  Sube el contenido de la carpeta `dist` que se creará a tu hosting.

---
*Hecho con ❤️ por tu Asistente de IA.*
