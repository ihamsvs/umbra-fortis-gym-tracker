-- =========================================================
-- ESQUEMA SUPABASE: UMBRA FORTIS — GYM TRACKER
-- =========================================================
-- Ejecuta este script completo en el SQL Editor de tu proyecto Supabase.

-- 1. TABLA: AMIGOS / LEVANTADORES
CREATE TABLE IF NOT EXISTS public.friends (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    color TEXT NOT NULL,
    pin TEXT NOT NULL DEFAULT '1234',
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLA: EJERCICIOS
CREATE TABLE IF NOT EXISTS public.exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    equipment TEXT NOT NULL,
    description TEXT,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA: REGISTROS DE ENTRENAMIENTO (WORKOUT LOGS)
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id TEXT PRIMARY KEY,
    friend_id TEXT NOT NULL REFERENCES public.friends(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    sets JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    is_pr BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para optimizar consultas de rendimiento e historial
CREATE INDEX IF NOT EXISTS idx_workout_logs_friend_id ON public.workout_logs(friend_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise_id ON public.workout_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON public.workout_logs(date DESC);

-- =========================================================
-- SEGURIDAD ROW LEVEL SECURITY (RLS)
-- =========================================================
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para uso en equipo / app compartida
CREATE POLICY "Permitir lectura publica a amigos" 
ON public.friends FOR SELECT USING (true);

CREATE POLICY "Permitir insercion y modificacion a amigos" 
ON public.friends FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir lectura publica a ejercicios" 
ON public.exercises FOR SELECT USING (true);

CREATE POLICY "Permitir insercion y modificacion a ejercicios" 
ON public.exercises FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir lectura publica a registros de entrenamiento" 
ON public.workout_logs FOR SELECT USING (true);

CREATE POLICY "Permitir insercion y modificacion a registros de entrenamiento" 
ON public.workout_logs FOR ALL USING (true) WITH CHECK (true);

-- =========================================================
-- DATOS SEMILLA: EJERCICIOS BASE
-- =========================================================

INSERT INTO public.exercises (id, name, category, equipment, description, is_custom)
VALUES
    ('e1', 'Press de Banca con Barra', 'Pecho', 'Barra', 'Ejercicio rey de empuje para pectoral mayor.', false),
    ('e2', 'Press Inclinado con Mancuernas', 'Pecho', 'Mancuernas', 'Enfoque en la porción clavicular del pectoral.', false),
    ('e3', 'Sentadilla Trasera con Barra', 'Piernas', 'Barra', 'Ejercicio compuesto fundamental para cuadríceps y glúteos.', false),
    ('e4', 'Peso Muerto Rumano', 'Piernas', 'Barra', 'Trabajo intenso de isquiotibiales y glúteos.', false),
    ('e5', 'Press Militar con Barra', 'Hombros', 'Barra', 'Fuerza vertical de hombros y tríceps.', false),
    ('e6', 'Dominadas Lastradas', 'Espalda', 'Corporal', 'Tracción vertical para dorsal ancho.', false),
    ('e7', 'Remo con Barra', 'Espalda', 'Barra', 'Construcción de grosor de espalda.', false),
    ('e8', 'Curl de Bíceps con Barra EZ', 'Brazos', 'Barra', 'Aislamiento de bíceps.', false),
    ('e9', 'Fondos en Paralelas (Tríceps)', 'Brazos', 'Corporal', 'Empuje con peso corporal o lastre para tríceps y pecho.', false),
    ('e10', 'Elevación de Piernas Colgado', 'Core', 'Corporal', 'Fortalecimiento de abdomen bajo y flexores de cadera.', false)
ON CONFLICT (id) DO NOTHING;
