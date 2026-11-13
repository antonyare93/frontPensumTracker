import { readdirSync } from 'node:fs'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Arquitectura de src/: cada capa declara de qué carpetas NO puede importar.
// Los tests (*.test.ts, *.test.tsx) quedan fuera porque usan fixtures y helpers
// de otras capas; aun así no pueden usar rutas que esquiven el alias.

// Rutas que suben de carpeta (`../`, `./../`), que rodean el alias (`@/./x`,
// `@//x`, `@/a/../b`) o que entran por `src/` o por la raíz del disco.
const noAliasBypass = {
  regex: '(^|/)\\.\\.(/|$)|.+/\\.(/|$)|^@//|^src/|^/',
  message: 'Importa con el alias @/ y sin subir de carpeta.',
}

// Paquetes de npm: todo lo que no empieza por `@/` ni por `./`.
const noPackages = {
  regex: '^[^@.]|^@[^/]',
  message: 'Esta capa no usa librerías externas, tampoco React.',
}

const noDynamicImports = {
  selector: 'ImportExpression',
  message: 'Sin import() dinámico: esquiva la regla de capas.',
}

const tests = ['**/*.test.{ts,tsx}']

function restricted(forbidden, why, pure = false) {
  return [
    'error',
    {
      patterns: [
        noAliasBypass,
        ...(pure ? [noPackages] : []),
        { group: forbidden.flatMap(name => [`@/${name}`, `@/${name}/**`]), message: why },
      ],
    },
  ]
}

function layer(files, { forbidden, why, pure = false }) {
  return {
    files: [files],
    ignores: tests,
    rules: { 'no-restricted-imports': restricted([...forbidden, 'test', 'App', 'main'], why, pure) },
  }
}

// Una feature nueva nace con regla: la lista sale de las carpetas que existan.
const features = readdirSync(new URL('./src/features', import.meta.url), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)

// Únicos cruces permitidos entre features.
const mayCompose = { dashboard: ['pensum', 'grades'] }

const featureLayers = features.map(name =>
  layer(`src/features/${name}/**/*.{ts,tsx}`, {
    forbidden: [
      'services',
      ...features
        .filter(other => other !== name && !mayCompose[name]?.includes(other))
        .map(other => `features/${other}`),
    ],
    why: 'Una feature no importa de otra ni llama al backend; usa hooks.',
  }),
)

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [noAliasBypass] }] },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: tests,
    rules: { 'no-restricted-syntax': ['error', noDynamicImports] },
  },
  // De lo general a lo específico: el último bloque que aplica a un archivo gana.
  layer('src/*.{ts,tsx}', {
    forbidden: ['services', 'domain'],
    why: 'La raíz de src solo arma la app: importa de features y hooks.',
  }),
  layer('src/components/**/*.{ts,tsx}', {
    forbidden: ['services', 'features', 'hooks'],
    why: 'components no conoce features ni el backend.',
  }),
  layer('src/components/ui/**/*.{ts,tsx}', {
    forbidden: ['domain', 'services', 'hooks', 'features', 'types'],
    why: 'components/ui no conoce la app: solo importa de @/lib.',
  }),
  layer('src/lib/**/*.{ts,tsx}', {
    forbidden: ['components', 'features', 'hooks', 'services', 'domain', 'types'],
    why: 'lib son utilidades sin dependencias de la app.',
  }),
  layer('src/types/**/*.{ts,tsx}', {
    forbidden: ['components', 'features', 'hooks', 'services', 'domain', 'lib'],
    why: 'types solo declara tipos.',
    pure: true,
  }),
  layer('src/domain/**/*.{ts,tsx}', {
    forbidden: ['components', 'features', 'hooks', 'services', 'lib'],
    why: 'domain son funciones puras: solo importa de @/types.',
    pure: true,
  }),
  layer('src/services/**/*.{ts,tsx}', {
    forbidden: ['components', 'features', 'hooks', 'domain', 'lib'],
    why: 'services habla con el backend: solo importa de @/types.',
    pure: true,
  }),
  layer('src/hooks/**/*.{ts,tsx}', {
    forbidden: ['components', 'features', 'lib'],
    why: 'hooks conecta services y domain; no importa interfaz.',
  }),
  layer('src/features/**/*.{ts,tsx}', {
    forbidden: ['services'],
    why: 'Una feature no llama al backend; usa hooks.',
  }),
  ...featureLayers,
])
