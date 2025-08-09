#!/usr/bin/env node

// Importaciones necesarias
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

/**
 * Ejecuta un comando de forma síncrona en el shell, mostrando la salida.
 * Incluye manejo básico de errores.
 * @param {string} command - El comando a ejecutar.
 * @param {string} cwd - El directorio de trabajo actual para el comando (opcional).
 */
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`\n$: ${command}`); // Muestra el comando
    execSync(command, { stdio: "inherit", cwd }); // Ejecuta y muestra salida
  } catch (error) {
    console.error(`\n❌ Error ejecutando el comando: ${command}`);
    if (error && error.message) console.error(error.message);

    // Relanzamos errores para comandos críticos de inicialización
    if (command.includes("npx cap init") || command.includes("npm init")) {
      throw error;
    }

    // Mensaje de ayuda genérico para comandos no críticos
    console.error("\n💡 Asegúrate de estar en el directorio raíz de tu proyecto JARC.");
    return false;
  }
  return true;
}

/**
 * Crea una carpeta www con un index.html, css y js básicos.
 * @param {string} wwwPath - Ruta donde crear la carpeta www.
 * @param {string} appName - Nombre de la aplicación para el título.
 */
function createBasicWww(wwwPath, appName) {
  if (!fs.existsSync(wwwPath)) {
    fs.mkdirSync(wwwPath, { recursive: true });
  }

  // Crear carpetas css y js
  const cssPath = path.join(wwwPath, "css");
  const jsPath = path.join(wwwPath, "js");
  if (!fs.existsSync(cssPath)) {
    fs.mkdirSync(cssPath);
    console.log("📂 Creada carpeta www/css.");
  }
  if (!fs.existsSync(jsPath)) {
    fs.mkdirSync(jsPath);
    console.log("📂 Creada carpeta www/js.");
  }

  // Contenido del archivo CSS
  const cssContent = `
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f4f4;
  color: #333;
  line-height: 1.6;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
}
.container {
  max-width: 800px;
  margin: 20px;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  border-radius: 8px;
}
h1 { color: #007bff; margin-bottom: 10px; }
p { margin-bottom: 15px; }
`;

  fs.writeFileSync(path.join(cssPath, "style.css"), cssContent);
  console.log("📄 Creado archivo www/css/style.css básico.");

  // Contenido del archivo JS
  const jsContent = `
console.log('¡JARC iniciado!');

// Puedes añadir aquí tu lógica JavaScript
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM completamente cargado y parseado.');
});
`;
  fs.writeFileSync(path.join(jsPath, "main.js"), jsContent);
  console.log("📄 Creado archivo www/js/main.js básico.");

  // Contenido del archivo HTML
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <link rel="stylesheet" href="./css/style.css">
</head>
<body>
  <div class="container">
    <h1>¡Bienvenido a tu App ${appName}!</h1>
    <h2>Generada con JARC</h2>

    <p>
      Edita los archivos en la carpeta <code>www</code> para empezar a construir tu interfaz y lógica.
    </p>

    <p>
      Framework creado por: Jeison Arturo Rios Castaño
      <br>Contacto: <a href="https://www.linkedin.com/in/jeisonrios/" target="_blank">LinkedIn</a>
    </p>
  </div>

  <script src="./js/main.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(wwwPath, "index.html"), htmlContent);
  console.log("📄 Creado archivo www/index.html");
}

/**
 * Sincroniza Capacitor para una plataforma específica.
 * @param {string} platform - 'android'|'ios'
 * @param {string} cwd - directorio raíz del proyecto
 */
function syncProject(platform, cwd = process.cwd()) {
  console.log(`\n🔄 Sincronizando proyecto Capacitor para ${platform}...`);
  return runCommand(`npx cap sync ${platform}`, cwd);
}

/**
 * Abre el proyecto en el IDE nativo correspondiente.
 * Para Android se usa por defecto: jarc open -> Android
 * Para iOS: jarc open ios
 * @param {string} platform
 */
function openProject(platform) {
  console.log(`\nAbrindo proyecto en el IDE nativo para ${platform}...`);
  if (platform === "ios" && process.platform !== "darwin") {
    console.warn("\n⚠️ Advertencia: Para abrir y trabajar con el proyecto iOS necesitas macOS y Xcode.");
  }
  try {
    runCommand(`npx cap open ${platform}`);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Sanitize de segmentos para el appId
 */
function sanitizeIdSegment(s) {
  if (!s) return "app";
  return s.toString().toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Genera APK debug y lo copia a www/<appName>.apk
 * @param {string} projectRoot
 * @param {string} appNameSanitized
 */
function buildAndCopyApk(projectRoot, appNameSanitized) {
  console.log("\n🔧 Generando APK (debug) automáticamente...");

  // Sync antes
  if (!syncProject("android", projectRoot)) {
    console.warn("⚠️ Falló npx cap sync android — abortando generación de APK.");
    return false;
  }

  const androidDir = path.join(projectRoot, "android");
  // Ejecutar gradle wrapper adecuado
  if (process.platform === "win32") {
    if (!runCommand("gradlew.bat assembleDebug", androidDir)) {
      console.warn("⚠️ gradlew.bat assembleDebug falló.");
      return false;
    }
  } else {
    if (!runCommand("./gradlew assembleDebug", androidDir)) {
      console.warn("⚠️ ./gradlew assembleDebug falló.");
      return false;
    }
  }

  const apkSrc = path.join(androidDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
  const wwwDir = path.join(projectRoot, "www");
  const apkDest = path.join(wwwDir, `${appNameSanitized}.apk`);

  try {
    if (!fs.existsSync(apkSrc)) {
      console.warn(`\n⚠️ No existe el APK en: ${apkSrc}. Revisa la compilación de Gradle.`);
      return false;
    }
    fs.mkdirSync(wwwDir, { recursive: true });
    fs.copyFileSync(apkSrc, apkDest);
    console.log(`\n✅ APK generado y copiado a: ${apkDest}`);
    return true;
  } catch (err) {
    console.error("\n❌ Error copiando el APK:", err.message || err);
    return false;
  }
}

/**
 * Función principal (main)
 * - toma appName del directorio actual
 * - crea / usa www
 * - inicializa npm / capacitor según sea necesario
 * - instala solo @capacitor/filesystem
 * - agrega plataformas según selección (Android por defecto)
 * - intenta abrir IDEs y genera APK automáticamente para Android
 */
async function main() {
  // Mensaje de bienvenida (tal como lo tenías)
  console.log("-------------------------------------");
  console.log("🚀 Bienvenido a JARC 🚀");
  console.log("     Creado por: Jeison Arturo Rios Castaño");
  console.log("-------------------------------------");

  const projectRoot = process.cwd();

  // Nombre de la app = nombre de la carpeta actual
  const rawAppName = path.basename(projectRoot) || "mi-app-jarc";
  const appNameSanitized = sanitizeIdSegment(rawAppName) || "miapp";

  // User para appId: process.env.USER || process.env.USERNAME || fallback carpeta padre
  let envUser = process.env.USER || process.env.USERNAME || "";
  if (!envUser) {
    envUser = path.basename(path.dirname(projectRoot)) || "user";
  }
  const userSegment = sanitizeIdSegment(envUser) || "user";

  const appId = `com.${userSegment}.${appNameSanitized}`;

  console.log(`\n📁 Directorio actual: ${projectRoot}`);
  console.log(`📛 Nombre de la app (tomado del directorio): ${rawAppName}`);
  console.log(`🆔 ID de la app: ${appId}`);

  // Preguntamos solo por plataformas. Android es el objetivo principal; quien necesite iOS lo selecciona.
  const respuestas = await inquirer.prompt([
    {
      type: "checkbox",
      name: "platforms",
      message:
        "¿Qué plataformas nativas querés agregar? (iOS requiere macOS/Xcode) - Android es la predeterminada",
      choices: ["android", "ios"],
      default: ["android"],
    },
  ]);

  const platforms = respuestas.platforms || [];

  // Manejo de www: si no existe, lo creamos
  const wwwPath = path.join(projectRoot, "www");
  if (fs.existsSync(wwwPath) && fs.lstatSync(wwwPath).isDirectory()) {
    console.log("\n📦 Se detectó carpeta 'www' — se usará tu contenido web existente.");
  } else {
    console.log("\n🌐 No se encontró 'www'. Creando 'www' básico...");
    createBasicWww(wwwPath, rawAppName);
  }

  try {
    // Inicializar NPM si no existe package.json
    const pkgJsonPath = path.join(projectRoot, "package.json");
    if (!fs.existsSync(pkgJsonPath)) {
      console.log("\n📦 Inicializando NPM en el proyecto...");
      runCommand("npm init -y", projectRoot);
    } else {
      console.log("\nℹ️ package.json detectado — se omite npm init.");
    }

    // Instalar Capacitor CLI y Core (si no están)
    console.log("\n📥 Instalando Capacitor CLI y Core...");
    runCommand("npm install @capacitor/cli @capacitor/core", projectRoot);

    // Inicializar Capacitor si no existe la config
    const capJson = path.join(projectRoot, "capacitor.config.json");
    const capTs = path.join(projectRoot, "capacitor.config.ts");
    if (!fs.existsSync(capJson) && !fs.existsSync(capTs)) {
      console.log("\n⚙️ Inicializando Capacitor en el proyecto...");
      runCommand(`npx cap init "${rawAppName}" "${appId}" --web-dir="www"`, projectRoot);
    } else {
      console.log("\nℹ️ Configuración de Capacitor detectada — se omite init.");
    }

    // Agregar plataformas según la selección
    if (platforms.includes("android")) {
      console.log("\n🤖 Agregando plataforma Android...");
      runCommand("npm install @capacitor/android", projectRoot);
      runCommand("npx cap add android", projectRoot);
    }
    if (platforms.includes("ios")) {
      console.log("\n🍏 Agregando plataforma iOS (opcional)...");
      runCommand("npm install @capacitor/ios", projectRoot);
      runCommand("npx cap add ios", projectRoot);
    }

    // Sincronizar (cap sync)
    console.log("\n🔄 Sincronizando proyecto JARC (cap sync)...");
    runCommand("npx cap sync", projectRoot);

    // 9. Abrir IDE (Opcional y condicional) - Intentamos abrir automáticamente
    let openedIDE = false;
    if (platforms.includes("android")) {
      console.log("\nIntentando abrir proyecto en Android Studio...");
      openedIDE = openProject("android"); // openProject retorna true/false
      if (!openedIDE) {
        console.warn(
          "🟡 No se pudo abrir Android Studio automáticamente. Asegúrate de que esté instalado y configurado en tu PATH, o ábrelo manualmente con 'jarc open' o 'npx cap open android'."
        );
      }
    }
    // Solo intentar abrir Xcode en macOS si se seleccionó iOS
    if (platforms.includes("ios") && process.platform === "darwin") {
      console.log("\nIntentando abrir proyecto en Xcode...");
      const openedIOS = openProject("ios");
      if (openedIOS) {
        openedIDE = true; // Si se abrió iOS, consideramos que se abrió un IDE
      } else {
        console.warn(
          "🟡 No se pudo abrir Xcode automáticamente. Asegúrate de que esté instalado, o ábrelo manualmente con 'jarc open ios' o 'npx cap open ios'."
        );
      }
    }

    // --- Paso nuevo: Generar APK debug automáticamente (si Android fue seleccionado) ---
    if (platforms.includes("android")) {
      const ok = buildAndCopyApk(projectRoot, appNameSanitized);
      if (!ok) {
        console.warn(
          "\n⚠️ La generación automática del APK falló o no se completó. Revisa la salida anterior."
        );
      }
    }

    // 10. Mensaje final (mantengo el estilo de salida que tenías)
    console.log("\n-----------------------------------------");
    console.log("✅ ¡Tu proyecto JARC ha sido creado exitosamente!.");
    console.log(`   App: ${rawAppName}`);
    console.log(`   ID: ${appId}`);
    console.log("     Framework creado por Jeison Arturo Rios Castaño");
    console.log("     Contacto: https://www.linkedin.com/in/jeisonrios/");
    console.log(`\n➡️ Directorio del proyecto: ${projectRoot}`);
    console.log("\nSiguientes pasos sugeridos:");
    if (!openedIDE) {
      console.log(`   Para abrir en Android Studio manualmente escribe: jarc open`);
    }
    if (platforms.includes("ios") && process.platform === "darwin") {
      console.log(`   Para abrir en Xcode (en macOS) manualmente: jarc open ios`);
    }
    console.log(`   1. ¡Continua desarrollando tu app en la carpeta 'www'!`);
    console.log(`   2. Para sincronizar cambios realizados en www: jarc update [ios]`);
    console.log(`   3. El APK de tu aplicación se encuentra en la carpeta www, con el nombre: ${appNameSanitized}.apk`);
    console.log(`   ¡LISTO PARA COMPARTIR E INSTALAR!`);
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("\n🚨🚨🚨 Ocurrió un error durante la creación del proyecto. 🚨🚨🚨");
    console.error("Revisa los mensajes anteriores para más detalles.");
    process.exit(1); // Salir con código de error
  }
}

// --- Lógica para manejar argumentos de línea de comandos ---
const args = process.argv.slice(2); // Obtiene los argumentos después del nombre del script

if (args.length > 0) {
  const command = args[0].toLowerCase();
  const platformArg = args[1] ? args[1].toLowerCase() : null;
  const projectRoot = process.cwd(); // Directorio actual

  switch (command) {
    case "update":
      if (platformArg === "ios") {
        syncProject("ios", projectRoot);
      } else {
        // Por defecto, sincroniza Android si no se especifica
        syncProject("android", projectRoot);
      }
      break;

    case "open":
      // jarc open -> abre Android; jarc open ios -> abre ios
      if (platformArg === "ios") {
        openProject("ios");
      } else {
        openProject("android");
      }
      break;

    case "apk":
      // jarc apk -> android; jarc apk ios -> ios
      if (platformArg === "ios") {
        console.warn("\n🍏 Generando build para iOS...");
        console.warn("⚠️ Esto requiere macOS y Xcode instalado.");
        runCommand(`npx cap sync ios`, projectRoot);
        runCommand(`npx cap build ios`, projectRoot);
        console.log("\n✅ Proyecto iOS compilado.");
        console.log(
          "Para generar el archivo IPA, abre Xcode o usa xcodebuild con exportOptionsPlist."
        );
      } else {
        // Android default
        buildAndCopyApk(projectRoot, sanitizeIdSegment(path.basename(projectRoot)));
      }
      break;

    default:
      // Si el comando no es reconocido, ejecuta el flujo de creación principal
      console.log(`\nComando no reconocido: '${command}'. Iniciando flujo de creación de proyecto.`);
      main(); // Ejecuta la función principal de creación
      break;
  }
} else {
  // Si no hay argumentos, ejecuta el flujo de creación principal
  main();
}
