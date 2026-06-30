/// <reference types="vite/client" />

/**
 * Variables de entorno disponibles en tiempo de compilación para Vite.
 *
 * @see {@link https://vitejs.dev/guide/env-and-mode.html}
 */
interface ImportMetaEnv {
    /** URL base de la API del backend. */
    readonly VITE_API_URL: string
    /** Nombre de la aplicación expuesto al cliente. */
    readonly VITE_APP_NAME: string
    // more env variables...
}

/**
 * Extensión del objeto `ImportMeta` para incluir las variables de entorno tipadas.
 */
interface ImportMeta {
    /** Conjunto de variables de entorno definidas en archivos `.env`. */
    readonly env: ImportMetaEnv
}
