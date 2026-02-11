# Admin Panel (PHP)

Proyecto de panel de administración en PHP

## Requisitos

- **Windows** (recomendado: XAMPP)
- **PHP 8.1+** (ideal 8.2+)
- **MySQL/MariaDB**
- Navegador (Chrome/Edge)

## Estructura básica

- `public/` → archivos públicos (vistas, assets JS/CSS)
- `src/` → controladores, modelos, helpers, config
- `api.php` → router/endpoint principal para el frontend
- `admin-panel.sql` → script SQL para crear BD/tablas (y/o datos iniciales)

## Configuración de Base de Datos

1. Crea una base de datos en MySQL/MariaDB (por ejemplo: `admin_panel`).

2. Importa el archivo **`admin-panel.sql`**.

### Opción A: Importar con phpMyAdmin (XAMPP)
1. Abre **phpMyAdmin**: `http://localhost/phpmyadmin`
2. Crea la BD (si no existe).
3. Entra a la BD → pestaña **Importar**
4. Selecciona el archivo `admin-panel.sql` y ejecuta.

### Opción B: Importar por consola (MySQL)
Desde una terminal, ubicándote en la carpeta donde está `admin-panel.sql`:

```bash
mysql -u root -p admin_panel < admin-panel.sql
```

> Cambia `admin_panel` por el nombre real de tu BD.

## Configurar el archivo `.env`

Crea el archivo **`.env`** en la raíz del proyecto con tus credenciales de base de datos:

```env
DB_HOST=localhost
DB_NAME=admin_panel
DB_USER=root
DB_PASS=
```

- `DB_HOST`: host de MySQL (ej. `localhost`)
- `DB_NAME`: nombre de la base de datos
- `DB_USER`: usuario
- `DB_PASS`: contraseña (vacía por defecto en XAMPP)

## Correr el proyecto con el servidor embebido de PHP

**php -S localhost:8000 -t public public/router.php**


Luego abre en el navegador:

- `http://localhost:8000/`