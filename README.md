<div align="center">

# 🦇 UMBRA FORTIS
### *Fuerza en la Sombra — Home Gym Tracker & Social League*

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-facc15?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

<p align="center">
  <strong>Aplicación web progresiva (PWA) de alto rendimiento para el registro de entrenamientos, sobrecarga progresiva, cálculo de cargas y competencia deportiva entre amigos en gimnasio de casa.</strong>
</p>

[✨ Características](#-características-principales) •
[📱 Formato Stories](#-historias-de-logros-916-para-instagram--whatsapp) •
[🛠️ Stack Tecnológico](#-stack-tecnológico) •
[🚀 Inicio Rápido](#-instalación-y-desarrollo-local) •
[📦 Despliegue](#-despliegue-en-vercel)

---

</div>

## 📖 ¿De qué trata el proyecto?

**Umbra Fortis** (*"Fuerza en la Sombra"*) es una plataforma de entrenamiento diseñada con estética oscura y temática inspirada en Batman/Gotham para atletas que entrenan en casa y desean llevar un control milimétrico de su fuerza, superar sus marcas personales (**PRs**) y compartir sus progresos con su grupo de entrenamiento.

La aplicación permite registrar rutinas diarias organizadas por enfoque muscular (*Día de Pecho, Día de Espalda, Push Day, etc.*), calcular automáticamente el 1RM estimado (fórmula Epley), visualizar gráficos de progresión por ejercicio, calcular combinaciones de discos para barra olímpica y exportar tarjetas virales en formato vertical 9:16 listas para compartir en **Instagram Stories**, **WhatsApp** y redes sociales.

---

## ✨ Características Principales

### ⚡ 1. Registro de Entrenamientos en Vivo por Día
- **Enfoque de Rutina Personalizable**: Selector visual de rutinas (*Día de Pecho, Día de Espalda, Piernas, Hombros, Push Day, Pull Day, Leg Day, Full Body*) o títulos personalizados.
- **Flujo de Series sin Fricción**: Registro rápido de pesos y repeticiones con autocompletado de la última sesión realizada.
- **Auto-Scroll Inteligente**: Al añadir un ejercicio nuevo, la vista se centra suavemente en pantalla.
- **Detección Automática de PRs**: Alerta en tiempo real y celebración al romper récords personales.
- **Modo Anotación Rápida**: Modal para registrar un levantamiento puntual en cualquier momento sin abrir una sesión completa.

### 🔒 2. Seguridad Multi-Usuario y Bloqueo de Perfiles
- **Autenticación Protegida por PIN**: Cuentas individuales para cada atleta del equipo (*Iham, Matias, Ignacio, Lucas, Jarod*).
- **Protección Anti-Suplantación**: Cada sesión queda firmada inmutablemente por el usuario logueado. No se puede cambiar de atleta sin antes cerrar sesión e ingresar la contraseña correspondiente.

### 📋 3. Historial Organizado por Días de Entrenamiento
- **Tarjetas de Sesión Diaria**: Registros agrupados por día completo con resumen de volumen total (kg), series totales, cantidad de ejercicios y medallas de récords.
- **Desglose Detallado**: Visualización clara de cada ejercicio y sus series (`100kg × 8`, `105kg × 6`).
- **Filtros Rápidos & Buscador**: Filtrado por tipo de rutina, por atleta y búsqueda en tiempo real por texto o notas.

### 📈 4. Gráficos de Progresión y Fuerza
- **Histórico Completo de Ejercicios**: Integración de ejercicios base, personalizados y registros históricos sin omitir ninguno.
- **Métricas Clave**: Evolución de 1RM estimado, peso máximo levantado y volumen total en el tiempo.
- **Filtros por Grupo Muscular**: Exploración rápida por *Pecho, Espalda, Piernas, Hombros, Brazos y Core*.

### 👤 5. "Mi Perfil" & Liga de Compañeros
- **Dashboard del Atleta**: Métricas globales de volumen, sesiones acumuladas, PRs y mejores marcas en levantamientos principales.
- **Compañeros de Gimnasio**: Tarjetas de progreso de los demás miembros del equipo para fomentar una competencia sana.

### 🏋️‍♂️ 6. Calculadora de Discos de Barra
- **Distribución por Lado**: Cálculo automático de los discos necesarios por cada lado de la barra (25, 20, 15, 10, 5, 2.5, 1.25 kg) para alcanzar el peso objetivo deseado.
- **Configuración Personalizada**: Peso de barra ajustable (barra estándar, olímpica o personalizada).

### ☁️ 7. Sincronización en la Nube con Supabase (Offline-First)
- **Persistencia Local Inmediata**: Funcionamiento ultra rápido con `localStorage` y sincronización bidireccional en segundo plano con base de datos PostgreSQL en **Supabase**.

---

## 📸 Historias de Logros 9:16 para Instagram & WhatsApp

Inspirado en el formato visual de **Spotify Wrapped** e **Instagram Stories**, cada vez que un atleta rompe un récord personal (PR), puede abrir la tarjeta de logro 9:16:

- **Estética Dark Obsidian & Neón**: Fondo `#050505` con resplandor dorado y el murciélago de Batman de fondo en filigrana.
- **Tipografía Masiva de Peso**: Cifra gigante (**`100 KG`** con **`× 5 REPS`**), ejercicio y badge de **`1RM ESTIMADO`**.
- **Motor Canvas PNG 1080×1920**: Descarga instantánea de la imagen en ultra alta resolución lista para publicar.
- **Web Share API & WhatsApp Directo**: Compartición nativa con 1 toque en smartphones y enlace preformateado para WhatsApp.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework** | [Next.js 16.3 (Turbopack, App Router, Server Actions)](https://nextjs.org/) |
| **Librería UI** | [React 19](https://react.dev/) |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org/) (Tipado Estricto) |
| **Estilos & Animaciones** | [Tailwind CSS v4](https://tailwindcss.com/) con micro-interacciones CSS fluidas |
| **Base de Datos & Backend** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Iconografía** | [Lucide React](https://lucide.dev/) + Silueta Vectorial Oficial de Batman |
| **Renderizado Gráfico** | HTML5 Canvas API (Generador PNG 1080×1920) |
| **PWA** | Web App Manifest & Service Worker Ready |

---

## 🚀 Instalación y Desarrollo Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18.18+ o v20+
- Gestor de paquetes [pnpm](https://pnpm.io/) (o `npm` / `yarn`)

### 1. Clonar el repositorio
```bash
git clone https://github.com/ihamsvs/umbra-fortis-gym-tracker.git
cd umbra-fortis-gym-tracker
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto con las credenciales de tu proyecto de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

### 4. Iniciar el servidor de desarrollo
```bash
pnpm dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

### 5. Compilar para producción
```bash
pnpm build
pnpm start
```

---

## 📁 Estructura del Proyecto

```plaintext
gym-tracker/
├── actions/             # Server Actions de Next.js (workouts, exercises, friends)
│   ├── exercises.ts
│   ├── friends.ts
│   └── workouts.ts
├── app/                 # Next.js App Router (Páginas, layouts y estilos globales)
│   ├── globals.css      # Tokens de Tailwind CSS v4 y keyframes de animación
│   ├── layout.tsx       # Metadata, PWA icons y fuentes Geist
│   ├── page.tsx         # Coordinador principal de estado y autenticación
│   └── manifest.ts      # Web App Manifest PWA
├── components/          # Componentes modulares de React
│   ├── BatIcon.tsx            # Silueta SVG clásica y oficial de Batman
│   ├── FriendAvatar.tsx       # Avatar con monograma y colores distintivos
│   ├── HistoryLog.tsx         # Historial agrupado por sesiones de entrenamiento
│   ├── LoginScreen.tsx        # Pantalla de acceso seguro con PIN
│   ├── Navbar.tsx             # Barra de navegación con cápsula de cuenta segura
│   ├── PlateCalculator.tsx    # Calculadora de discos de barra
│   ├── PRShareStoryModal.tsx  # Generador de historias 9:16 (Instagram & WhatsApp)
│   ├── ProfileView.tsx        # Vista "Mi Perfil" y ranking de compañeros
│   ├── ProgressCharts.tsx     # Gráficos de progresión y fuerza por ejercicio
│   ├── QuickLogModal.tsx      # Modal para registro rápido de pesos
│   └── WorkoutLogger.tsx      # Registrador en vivo de entrenamientos por día
├── lib/                 # Utilidades, cálculos de 1RM/volumen y sincronización
│   ├── supabase.ts
│   ├── supabaseSync.ts
│   └── utils.ts
├── public/              # Íconos PWA y assets vectoriales
└── types/               # Definiciones de tipos TypeScript (Friend, WorkoutLog, etc.)
    └── gym.ts
```

---

## 📦 Despliegue en Vercel

La forma más rápida y recomendada de desplegar este proyecto es utilizando [Vercel](https://vercel.com/):

1. Sube tu repositorio a GitHub.
2. Importa el repositorio en Vercel.
3. Añade las Variables de Entorno (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Haz clic en **Deploy**.

---

<div align="center">
  <p>Desarrollado para la Liga <strong>Umbra Fortis</strong> 🦇💪</p>
  <p><em>"No es quién soy en el interior, sino lo que levanto lo que me define."</em></p>
</div>
