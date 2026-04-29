# CheckMate - Sistema de Validación Automatizada

CheckMate es una plataforma full-stack diseñada para automatizar la recepción, validación y consolidación de evidencias (actividades escolares, académicas, vocacionales, etc.) enviadas por usuarios a través de WhatsApp.

El sistema recibe capturas de pantalla, utiliza un algoritmo de reconocimiento óptico de caracteres (OCR) para extraer la información, y clasifica la evidencia asignando un puntaje de confianza. Todo esto se visualiza en un panel de administración estilo *Glassmorphism* moderno, con capacidades de exportación a Excel.

## 🚀 Características Principales

- **Procesamiento OCR Automatizado**: Extrae texto de imágenes usando Tesseract.js.
- **Clasificación Inteligente**: Asigna automáticamente categorías (Escolar, Academia, Vocacional) y estados (Aprobado, Pendiente, Rechazado) basados en el análisis del texto.
- **Dashboard Premium (Glassmorphism)**: Interfaz de usuario construida con Next.js, Tailwind CSS y Framer Motion.
- **Exportación a Excel**: Generación de reportes limpios y formateados con `exceljs`.
- **Integración de Webhook**: Endpoint preparado para recibir eventos desde la API de WhatsApp Business.
- **Base de Datos Relacional**: Utiliza PostgreSQL (o SQLite para desarrollo local) mediante Prisma ORM.

## 🛠️ Stack Tecnológico

**Frontend:**
- [Next.js 15+](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) (Iconos)
- [Framer Motion](https://www.framer.com/motion/) (Animaciones)
- [ExcelJS](https://github.com/exceljs/exceljs) (Exportación)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [Tesseract.js](https://tesseract.projectnaptha.com/) (Motor OCR)
- [SQLite](https://sqlite.org/) (Configurado para desarrollo local rápido)

## 📦 Estructura del Proyecto

El repositorio está dividido en dos monorepositorios principales siguiendo la arquitectura MVC:

```text
checkMate/
├── backend/              # Servidor Express, Prisma y lógica OCR
│   ├── prisma/           # Esquema de base de datos y migraciones
│   ├── src/
│   │   ├── controllers/  # Lógica de las rutas (Evidence, Webhook)
│   │   ├── routes/       # Definición de endpoints REST API
│   │   ├── services/     # Servicio de extracción de texto OCR
│   │   └── index.js      # Punto de entrada del servidor (Puerto 3001)
│   └── .env              # Variables de entorno (URL de DB)
│
└── frontend/             # Panel de Administración en Next.js
    ├── src/
    │   ├── app/          # Páginas (Dashboard, Evidencias, Configuración)
    │   ├── components/   # Componentes reusables (Sidebar, StatCards, Table)
    │   └── lib/          # Utilidades (Exportar Excel, Mock Data)
    └── tailwind.css      # Configuración global del tema Glassmorphism
```

## ⚙️ Instalación y Uso Local

Sigue estos pasos para arrancar el entorno de desarrollo en tu máquina:

### 1. Iniciar el Backend
Abre una terminal y navega a la carpeta del backend:
```bash
cd backend
npm install
```

Sincroniza la base de datos (SQLite) y levanta el servidor:
```bash
npx prisma generate
npx prisma db push
npm start
```
El servidor backend estará corriendo en `http://localhost:3001`.

### 2. Iniciar el Frontend
Abre otra terminal y navega a la carpeta del frontend:
```bash
cd frontend
npm install
```

Levanta el servidor de desarrollo de Next.js:
```bash
npm run dev
```
El dashboard estará disponible en `http://localhost:3000`.

## 🧪 Probar el Webhook Manualmente

Puedes simular la recepción de una imagen vía WhatsApp enviando un POST request al webhook del backend. Esto procesará la imagen por OCR y actualizará la base de datos en tiempo real.

```bash
curl -X POST http://localhost:3001/api/webhook \
-H "Content-Type: application/json" \
-d '{"imageUrl": "https://tesseract.projectnaptha.com/img/eng_bw.png", "senderName": "Alumno Prueba"}'
```
Refresca el panel web en `localhost:3000` y verás el registro nuevo.
