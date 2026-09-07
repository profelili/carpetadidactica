# 📁 Carpeta Didáctica

Aplicación web para organizar clases de **modalidades especiales** (domiciliarias,
hospitalarias, hogares convivenciales y otras), con base de datos de alumnos,
planificador de actividades y exportación a archivos `.doc` compatibles con
Google Docs y Word.

Hecha con **React + Vite + Tailwind CSS**. Los datos se guardan automáticamente
en el navegador (localStorage) y pueden respaldarse como archivo JSON desde el
botón **«Respaldo»** del Panel de alumnos.

---

## 🖱 Opción recomendada: GitHub Desktop (sin comandos)

> 💡 El campo **«Owner / Propietario»** NO se escribe a mano: es una lista
> desplegable que se completa sola cuando iniciás sesión en GitHub Desktop.
> Si aparece vacío, es porque falta el paso 1.

1. Instalá [GitHub Desktop](https://desktop.github.com) y luego
   **File → Options → Accounts → Sign in** con tu cuenta `profelili`.
2. En GitHub.com, renombrá el repo viejo para liberar el nombre:
   https://github.com/profelili/carpetadidactica → **Settings → Repository name**
   → cambiar a `carpetadidactica-vieja` → **Rename**.
3. En Desktop: **File → Add Local Repository** → elegí la carpeta del proyecto.
   Si dice que no es un repositorio, aceptá **create a repository**.
4. Escribí un resumen (ej.: «Carpeta Didáctica») y tocá **Commit to main**.
5. **Repository → Publish Repository**:
   - **Owner**: seleccioná `profelili` (ya aparece en la lista).
   - **Name**: `carpetadidactica`.
   - Destildá **Keep this code private**.
   - Tocá **Publish Repository**.
6. En GitHub: **Settings → Pages → Source: GitHub Actions**.
   El sitio quedará en **https://profelili.github.io/carpetadidactica**.

## ⌨️ Opción con Git (terminal)

```bash
git init
git add .
git commit -m "Carpeta Didáctica"
git branch -M main
git remote add origin https://github.com/profelili/carpetadidactica.git
git push -u origin main --force
```

> El `--force` es solo para la primera vez: reemplaza el contenido anterior del
> repositorio (`index.tar`, `static.yml`, etc.) por el código nuevo. Los cambios
> siguientes se suben con `git add . && git commit -m "mensaje" && git push`.

## ⚠️ Importante: el workflow viejo

Si en el repositorio quedó el archivo `.github/workflows/static.yml` de la
versión anterior, **borralo**: este proyecto incluye `deploy.yml`, que lo
reemplaza y publica el sitio con cada push.

## 🧪 Probar en tu computadora

```bash
npm install
npm run dev
```

Luego abrí la dirección que muestra la terminal (http://localhost:5173).

## 🔁 Pasar tus datos a otra computadora

1. En la app: **Panel de alumnos → Respaldo** (descarga un `.json`).
2. En la otra computadora abrí la app y tocá **Restaurar**, eligiendo ese archivo.

## 📄 Exportar a documentos

- **Padrón .doc** — listado completo de alumnos, por modalidad.
- **Guardar planificador en .doc** — actividades agrupadas por fecha,
  con alumnos, objetivos, consignas y recursos.
- Los archivos se abren directamente desde Google Docs o Word.

---

Prof. Liliana Álvarez ✏️
