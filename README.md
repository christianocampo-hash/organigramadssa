# Organigrama institucional · Servicio de Salud

Visualizador responsive y accesible del organigrama institucional 2026. La interfaz está construida con React, TypeScript, HTML semántico y CSS, y carga la información de cargos, nombres, fotografías y unidades desde un archivo JSON editable.

## Funcionalidades

- Organigrama responsive para escritorio, tablet y teléfono.
- Fichas de cargo con nombre, fotografía, unidad y descripción al seleccionar cada recuadro.
- Búsqueda por cargo, nombre o unidad.
- Control para aumentar o disminuir el tamaño del texto.
- Modo de alto contraste mediante inversión de colores.
- Navegación con teclado, foco visible, etiquetas ARIA y soporte para `prefers-reduced-motion`.
- Publicación automática en GitHub Pages mediante GitHub Actions.

## Ejecutar localmente

Requisitos: Node.js 22 o superior y pnpm 10.

```bash
pnpm install
pnpm dev
```

La aplicación quedará disponible en `http://localhost:3000`.

Para validar el proyecto y generar el build de producción:

```bash
pnpm run check
pnpm run build
```

## Actualizar nombres y fotografías

Edita el archivo:

```text
client/public/data/organigrama.json
```

Cada perfil contiene los campos `id`, `cargo`, `name`, `photo`, `unit` y `bio`. Para usar fotografías reales, reemplaza el valor de `photo` por una URL pública o por una ruta de imagen incluida dentro de `client/public`.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub. Se recomienda usar el mismo nombre que tendrá la URL pública, por ejemplo `organigrama-salud`.
2. Sube el contenido de este proyecto a la rama `main`:

```bash
git init
git add .
git commit -m "Preparar organigrama institucional"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

3. En GitHub, abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **GitHub Actions** como fuente.
5. El workflow `.github/workflows/deploy-pages.yml` construirá y publicará el sitio automáticamente en cada cambio enviado a `main`.
6. La URL quedará normalmente en:

```text
https://TU-USUARIO.github.io/TU-REPOSITORIO/
```

El proyecto detecta automáticamente el nombre del repositorio durante el workflow y ajusta la ruta base de Vite para que el JSON y los recursos funcionen dentro de esa subcarpeta.

## Licencia

MIT.
