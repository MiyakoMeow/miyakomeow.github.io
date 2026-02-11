/**
 * Vite 环境变量类型声明
 */
interface ImportMetaEnv {
  SSR?: boolean
  BASE_URL?: string
  MODE?: string
  DEV?: boolean
  PROD?: boolean
}

interface ImportMeta {
  env?: ImportMetaEnv
}
