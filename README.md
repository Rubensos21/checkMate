# CheckMate - Plataforma de Gestión Escolar

CheckMate es una plataforma web full-stack para administrar cursos, actividades, entregas y calificaciones dentro de un entorno escolar. El sistema permite que los estudiantes entreguen sus actividades, que los docentes revisen y califiquen manualmente esas entregas, y que el administrador controle usuarios, cursos y configuraciones generales del sistema.

La aplicación está organizada en dos partes: un backend con Express, Prisma y SQLite para la lógica del negocio, y un frontend en Next.js para la interfaz de usuario. Además, incluye herramientas para exportar información, cargar usuarios en lote mediante Excel y mantener un flujo de trabajo ordenado entre los distintos roles.

## Funcionalidad General de la Plataforma

La plataforma centraliza las operaciones principales de una escuela o grupo académico:

- Registro y administración de usuarios.
- Creación y gestión de cursos y actividades.
- Entrega de tareas por parte de estudiantes.
- Revisión manual de evidencias y asignación de calificaciones por docentes.
- Consulta de reportes y seguimiento académico.
- Exportación de información para análisis o respaldo.
- Configuración general del sistema.

## Roles del Sistema

### Administrador

El administrador tiene control total sobre la plataforma y es responsable de la administración general del sistema.

**Responsabilidades principales:**
- Crear, editar y eliminar usuarios.
- Registrar usuarios de forma individual o mediante carga masiva con Excel.
- Descargar una plantilla para preparar correctamente los datos de alta.
- Administrar cursos, actividades y configuración general.
- Consultar reportes globales del sistema.
- Revisar el estado general de entregas y calificaciones.

**Funciones disponibles:**
- Gestión de usuarios.
- Carga masiva de estudiantes, docentes y administradores.
- Administración de cursos y actividades.
- Visualización de reportes y exportaciones.
- Ajuste de temas y configuraciones de la plataforma.

### Docente

El docente es el encargado de supervisar el trabajo de sus grupos, revisar entregas y asignar calificaciones manualmente.

**Responsabilidades principales:**
- Crear y administrar actividades de sus cursos.
- Revisar las entregas enviadas por los estudiantes.
- Verificar la información y el contenido entregado.
- Asignar calificaciones y retroalimentación directamente en el sistema.
- Dar seguimiento al avance académico de sus grupos.

**Funciones disponibles:**
- Visualizar sus cursos y actividades.
- Consultar entregas por alumno o por actividad.
- Abrir cada entrega para revisarla manualmente.
- Calificar con una escala numérica y agregar comentarios.
- Revisar reportes relacionados con sus cursos.

### Estudiante

El estudiante utiliza la plataforma para consultar actividades, entregar sus trabajos y revisar su estado académico.

**Responsabilidades principales:**
- Consultar los cursos y actividades disponibles.
- Enviar sus entregas dentro del plazo establecido.
- Incluir comentarios o evidencias cuando sea necesario.
- Revisar el estado de sus entregas y las calificaciones recibidas.
- Consultar la retroalimentación enviada por el docente.

**Funciones disponibles:**
- Ver sus cursos inscritos.
- Revisar actividades pendientes y fechas límite.
- Subir evidencias o archivos de entrega.
- Consultar si su entrega fue revisada o calificada.
- Leer observaciones y comentarios del docente.

## Procesos Principales de la Plataforma

### Registro de usuarios

El administrador puede registrar usuarios uno por uno o cargar varios al mismo tiempo usando un archivo Excel. Antes de la carga masiva, el sistema permite descargar una plantilla para completar correctamente la información requerida.

### Creación de cursos y actividades

Los docentes o administradores pueden crear cursos y definir actividades con fecha de entrega, descripción y criterios de seguimiento.

### Entrega de actividades

El estudiante selecciona una actividad y sube su evidencia o comentario. El sistema almacena la información y la deja disponible para revisión docente.

### Revisión y calificación manual

El docente abre la entrega, verifica su contenido y asigna una calificación de manera manual. También puede añadir observaciones para orientar al estudiante.

### Consulta de reportes

La plataforma permite revisar listados de entregas, estados de actividades y resultados generales para apoyar el seguimiento académico.

## Características Principales

- Interfaz moderna construida con Next.js y Tailwind CSS.
- Administración de usuarios con roles diferenciados.
- Carga masiva de usuarios mediante archivo Excel.
- Plantilla descargable para preparar registros correctamente.
- Revisión manual de entregas y asignación de calificaciones.
- Exportación de información a Excel.
- Paneles organizados para cursos, usuarios, entregas y reportes.
- Base de datos relacional con Prisma ORM.

## Stack Tecnológico

### Frontend
- Next.js
- React
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express
- Prisma ORM
- SQLite para desarrollo local
- bcryptjs para contraseñas
- exceljs para plantillas y exportación

## Estructura del Proyecto

```text
checkMate/
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── uploads/
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   └── lib/
    └── public/
```

## Instalación y Uso Local

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node seed.js
npm start
```

El backend queda disponible en `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:3000`.

## Carga Masiva de Usuarios

La sección de administración incluye una opción de carga masiva para registrar usuarios desde un archivo Excel.

### Flujo de uso
1. El administrador abre la sección de usuarios.
2. Descarga la plantilla de Excel.
3. Completa los datos de cada usuario.
4. Carga el archivo en el sistema.
5. La plataforma valida la información y registra los usuarios válidos.
6. El sistema reporta filas exitosas y filas con errores.

### Validaciones incluidas
- Nombre y apellido paterno obligatorios.
- Rol obligatorio y limitado a `STUDENT`, `TEACHER` o `ADMIN`.
- Semestre y grupo obligatorios para estudiantes.
- Apellido materno opcional.
- Contraseña obligatoria.
- Detección de conflictos con datos duplicados o inválidos.

## Roles y Accesos Resumidos

- **Administrador**: controla usuarios, cursos, configuraciones y carga masiva.
- **Docente**: crea actividades, revisa entregas y califica manualmente.
- **Estudiante**: consulta actividades, entrega tareas y revisa sus resultados.

## Notas

- La calificación de entregas es manual y queda registrada en el sistema.
- Las entregas pueden incluir comentarios del estudiante y retroalimentación del docente.
- La plantilla de Excel está pensada para facilitar altas masivas sin errores de formato.
