# API de Politecnicos Galactic

API RESTful desarrollada en Node.js, Express y MySQL para el videojuego móvil "Politecnicos Galactic".

## Características

-   **Autenticación JWT**: Registro, login y protección de rutas.
-   **Gestión de Puntuaciones**: Guardado de partidas y rankings.
-   **Perfiles de Usuario**: Estadísticas de juego por usuario.
-   **Seguridad**: Hashing de contraseñas (bcrypt), validación de entradas, rate limiting y CORS.
-   **Base de Datos**: MySQL con Sequelize como ORM.
-   **Estructura Modular**: Código organizado en controladores, modelos, rutas y middleware.

## Requisitos Previos

-   Node.js (v14 o superior)
-   NPM o Yarn
-   Servidor de MySQL

## Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd politecnicos-galactic-api
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar la Base de Datos:**
    -   Asegúrate de que tu servidor MySQL esté corriendo.
    -   Ejecuta el script `sql/schema.sql` en tu cliente de MySQL para crear la base de datos y las tablas.
      ```sql
      -- Por ejemplo, usando el cliente de línea de comandos:
      mysql -u root -p < sql/schema.sql
      ```

4.  **Crear el archivo de entorno:**
    -   Copia el archivo `.env.example` a un nuevo archivo llamado `.env`.
    -   Edita el archivo `.env` con tus credenciales de la base de datos y una clave secreta para JWT.
      ```bash
      cp .env.example .env
      nano .env
      ```

5.  **Iniciar el servidor:**
    -   Para producción:
      ```bash
      npm start
      ```
    -   Para desarrollo (con reinicio automático):
      ```bash
      npm run dev
      ```

El servidor estará corriendo en `http://localhost:3000`.

## Documentación de Endpoints

**URL Base**: `/api`

### Autenticación (`/auth`)

-   **`POST /register`**: Registra un nuevo usuario.
    -   **Body**: `{ "username": "...", "email": "...", "password": "..." }`
    -   **Respuesta**: `{ success, message, data: { token, user } }`

-   **`POST /login`**: Inicia sesión.
    -   **Body**: `{ "login": "username_o_email", "password": "..." }`
    -   **Respuesta**: `{ success, message, data: { token, user } }`

-   **`POST /logout`**: Cierra la sesión (invalida el token en el cliente).
    -   **Requiere Autenticación (Bearer Token)**
    -   **Respuesta**: `{ success, message }`

-   **`GET /verify`**: Verifica si el token de sesión actual es válido.
    -   **Requiere Autenticación (Bearer Token)**
    -   **Respuesta**: `{ success, message, data: { user } }`

### Puntuaciones (`/scores`)

-   **`POST /`**: Guarda una nueva puntuación para el usuario autenticado. Solo se guarda si es mayor a su puntuación máxima anterior.
    -   **Requiere Autenticación (Bearer Token)**
    -   **Body**: `{ "puntuacion": 1500, "nivel_alcanzado": 5, "enemigos_destruidos": 120, "tiempo_jugado": 300 }`
    -   **Respuesta**: `{ success, message, data: { saved, score } }`

-   **`GET /user/:userId`**: Obtiene todas las puntuaciones de un usuario específico.
    -   **Respuesta**: `{ success, data: [ ...puntuaciones ] }`

-   **`GET /leaderboard`**: Obtiene el top 10 de mejores puntuaciones (una por usuario).
    -   **Respuesta**: `{ success, data: [ { puntuacion, usuario: { id, username } } ] }`

-   **`GET /leaderboard/:limit`**: Obtiene el top N de mejores puntuaciones.
    -   **Ejemplo**: `/api/scores/leaderboard/50`
    -   **Respuesta**: `{ success, data: [ ...ranking ] }`

### Usuario (`/user`)

-   **`GET /profile`**: Obtiene el perfil y las estadísticas de juego del usuario autenticado.
    -   **Requiere Autenticación (Bearer Token)**
    -   **Respuesta**: `{ success, data: { profile, stats } }`

---