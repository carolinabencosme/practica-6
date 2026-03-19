# Práctica 6 – Gestión de Reservas de Laboratorio

Aplicación serverless para gestionar solicitudes de acceso a laboratorios universitarios.

**Stack:** AWS Lambda · DynamoDB · API Gateway · React (Vite) · GitHub Pages

---

## Estructura del proyecto

```
practica-6/
├── lambda/
│   ├── shared/
│   │   └── reservaValidator.js   # Validaciones puras (reutilizables y testeables)
│   ├── crearReserva/
│   │   └── index.js              # POST /reservas
│   ├── listarActivas/
│   │   └── index.js              # GET  /reservas/activas
│   ├── listarPorRango/
│   │   └── index.js              # GET  /reservas/rango?fechaDesde=&fechaHasta=
│   ├── package.json
│   └── template.yaml             # SAM template (DynamoDB + Lambda + API Gateway)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ReservationForm.jsx      # Formulario de nueva reserva
│   │   │   ├── ActiveReservations.jsx   # Listado de reservas activas
│   │   │   └── PastReservations.jsx     # Consulta por rango de fechas
│   │   ├── services/
│   │   │   └── api.js            # Llamadas HTTP a la API
│   │   ├── config.js             # URL base de la API (desde variable de entorno)
│   │   └── App.jsx               # Navegación por pestañas
│   ├── .env.example              # Plantilla de variables de entorno
│   ├── package.json
│   └── vite.config.js
├── src/                          # Código previo (validador de usuarios)
├── tests/
│   ├── validator.test.js         # Tests del validador de usuarios
│   └── reservaValidator.test.js  # Tests del validador de reservas
└── package.json                  # Jest en la raíz
```

---

## Modelo de datos (DynamoDB)

Tabla **`Reservas`**

| Atributo        | Tipo   | Descripción                                 |
|-----------------|--------|---------------------------------------------|
| `idReserva`     | String | UUID (clave de partición)                   |
| `correo`        | String | Correo del estudiante                       |
| `nombre`        | String | Nombre completo                             |
| `estudianteId`  | String | ID del estudiante                           |
| `fecha`         | String | Fecha en formato `YYYY-MM-DD`               |
| `hora`          | Number | Hora del slot (8–22 inclusive)              |
| `laboratorio`   | String | Nombre del laboratorio                      |
| `labFechaHora`  | String | Clave compuesta `Lab#YYYY-MM-DD#hora` (GSI) |
| `createdAt`     | String | ISO timestamp de creación                   |

**GSI `LabSlotIndex`:** PK = `labFechaHora` → permite contar reservas por slot eficientemente.

---

## Reglas de negocio

- Máximo **7 personas por hora** por laboratorio.
- Horarios válidos: **8:00 AM a 10:00 PM** (slots de 1 hora: 8, 9, …, 22).
- No se pueden crear reservas para fechas pasadas.
- Una **reserva pasada** es cualquier reserva con fecha anterior a hoy, o una reserva del día actual cuyo slot ya terminó (si la reserva empieza a las 14:00, pasa a historial desde las 15:00).
- Todos los campos son obligatorios; el correo debe tener formato válido.
- La zona horaria oficial del sistema la define el backend mediante `TABLE_TZ_OFFSET`; frontend y backend deben usar ese criterio al interpretar "hoy" y el estado activa/pasada.

---

## Zona horaria oficial del sistema

- La zona horaria oficial se configura en el backend con la variable de entorno `TABLE_TZ_OFFSET`, expresada como desplazamiento entero respecto a UTC.
- El valor por defecto actual es `0`, es decir, **UTC**.
- Ejemplos: `-5` para UTC-5, `-6` para UTC-6, `1` para UTC+1.
- Las Lambdas usan esa configuración para calcular "hoy", la hora actual y si una reserva está activa o pasada.
- En el frontend, los campos `input[type="date"]` construyen la fecha local del navegador manualmente para evitar desfases causados por `toISOString()`.

### Cómo configurarla

1. Edita `lambda/template.yaml` y ajusta `TABLE_TZ_OFFSET` en `Globals > Function > Environment > Variables`.
2. Despliega nuevamente el backend con `sam build && sam deploy`.
3. Mantén documentado el valor elegido para que el equipo sepa cuál es la referencia oficial de fechas y horarios.

---

## Prerrequisitos

- [Node.js 18+](https://nodejs.org/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configurado
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

---

## 1 · Ejecutar tests

```bash
# Desde la raíz del repositorio
npm install
npm test
```

---

## 2 · Desplegar el backend en AWS

```bash
cd lambda

# Instalar dependencias de las funciones
npm install

# Construir y desplegar con SAM (la primera vez crea los recursos)
sam build
sam deploy --guided
# Responde a las preguntas; anota la URL del API Gateway que imprime al final.
```

> El `template.yaml` crea automáticamente:
> - Tabla DynamoDB `Reservas` con GSI `LabSlotIndex`
> - Tres funciones Lambda con permisos IAM mínimos
> - API Gateway con CORS habilitado para `*`

Para actualizaciones posteriores:

```bash
sam build && sam deploy
```

---

## 3 · Ejecutar el frontend en local

```bash
cd frontend

# 1. Configura la URL de la API
cp .env.example .env
# Edita .env y pon tu URL de API Gateway:
#   VITE_API_URL=https://<id>.execute-api.<region>.amazonaws.com/prod

# 2. Instala dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
# Abre http://localhost:5173 en el navegador
```

---

## 4 · Desplegar el frontend en GitHub Pages

```bash
cd frontend

# Asegúrate de que VITE_API_URL esté definida en .env
# El script predeploy fija VITE_BASE_PATH=/practica-6/ automáticamente

npm run deploy
```

Esto construye la app con la ruta base `/practica-6/` y la publica en la rama `gh-pages`.  
La app quedará disponible en: `https://<tu-usuario>.github.io/practica-6/`

> **Nota:** Si el nombre del repositorio es distinto, ajusta `VITE_BASE_PATH` en el script
> `predeploy` dentro de `frontend/package.json`.

---

## 5 · Endpoints de la API

| Método | Ruta                | Descripción                              |
|--------|---------------------|------------------------------------------|
| POST   | `/reservas`         | Crear una nueva reserva                  |
| GET    | `/reservas/activas` | Listar reservas activas (no expiradas)   |
| GET    | `/reservas/rango`   | Listar reservas pasadas por rango de fechas |

### POST `/reservas` – cuerpo JSON

```json
{
  "correo":      "estudiante@universidad.edu",
  "nombre":      "María López García",
  "id":          "A00123456",
  "fecha":       "2025-07-10",
  "hora":        14,
  "laboratorio": "Lab 1"
}
```

### GET `/reservas/rango` – query params

Devuelve únicamente reservas pasadas dentro del rango solicitado. No incluye reservas activas ni futuras.

```
?fechaDesde=2025-01-01&fechaHasta=2025-01-31
```

---

## 6 · Eliminar recursos de AWS

```bash
cd lambda
sam delete
```

---

## Capturas de pantalla de la aplicación

| Pestaña | Descripción |
|---------|-------------|
| Nueva Reserva | Formulario con validaciones en tiempo real |
| Reservas Activas | Tabla de reservas vigentes con botón de actualizar |
| Reservas Pasadas | Consulta de historial por rango de fechas con resultados en tabla |
