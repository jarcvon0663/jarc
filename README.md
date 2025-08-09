**JARC**
Un framework CLI simple y automatizado para generar aplicaciones móviles a partir de un proyecto web HTML/CSS/JS existente o generando una app base.

## 🚀 ¡Video Demo en YouTube! 🎬

👉 **Dale play y descubre JARC**  
🎥 https://youtu.be/zE7IpgjeRA8

✨ ¡No olvides suscribirte y dejar tu 👍!

**🚀 ¿Qué hace?**
JARC es una herramienta de línea de comandos diseñada para simplificar el proceso de convertir un proyecto web (ubicado en una carpeta www) en una aplicación móvil nativa. te permite escoger las plataformas nativas (Android/iOS) y hace el resto por ti.

**📦 Instalación**
Puedes instalar la herramienta globalmente en tu sistema para usarla desde cualquier directorio:

npm install -g jarc

**💡 Uso**
Abre tu terminal en el directorio donde quieres crear tu nuevo proyecto Capacitor.

Si ya tienes un proyecto web en una carpeta llamada www en este directorio, la herramienta lo copiará. Si no, creará una carpeta www básica con un index.html de ejemplo.

Ejecuta el comando:

jarc

La herramienta realizará la conversión de tu proyecto web en un apk.

**✨ Características**
Copia automática de tu carpeta www existente o creación de una básica.

Adición de plataformas Android y/o iOS.

Generación del apk listo para instalar.

Apertura automática del proyecto en Android Studio o Xcode.

**📋 Prerrequisitos**
Antes de usar esta herramienta, asegúrate de tener instalado y configurado:

Node.js: Versión 16.0.0 o superior. Puedes descargarlo desde nodejs.org. Incluye npm (Node Package Manager). Asegúrate de que Node.js y npm estén accesibles desde tu terminal (configura las variables de entorno si es necesario).

npm: Viene con Node.js.

**Android**: Android Studio y las herramientas de línea de comandos de Android SDK.

Gradle: Android Studio generalmente instala y gestiona Gradle, pero asegúrate de que esté correctamente configurado y en el PATH si encuentras problemas.

Configura las variables de entorno necesarias para el SDK de Android (ANDROID_SDK_ROOT).

**iOS (Solo en macOS)**:

Xcode y las herramientas de línea de comandos de Xcode.


**🛠️ Después de la creación**

Realiza los cambios en tu proyecto web dentro de la carpeta www.

Después de hacer cambios en www, sincroniza con las plataformas nativas ejecutando:

jarc update

Abre el proyecto en Android Studio (jarc open) o Xcode (jarc open ios) para construir, probar y ejecutar en emuladores o dispositivos.

**👤 Creador**

Jeison Arturo Rios Castaño
[LinkedIn](https://www.linkedin.com/in/jeisonrios/)
[Sitio Web](https://www.arturo-rios.com/)

**📜 Licencia**
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
