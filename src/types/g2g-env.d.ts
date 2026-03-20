/** Server-only G2G OpenAPI credentials (see docs.g2g.com). */
declare namespace NodeJS {
  interface ProcessEnv {
    G2G_API_KEY?: string
    /** Preferred; `G2G_SECRET` is still accepted for older .env files. */
    G2G_SECRET_KEY?: string
    G2G_SECRET?: string
    G2G_USER_ID?: string
    /** Optional override; default `https://open-api.g2g.com` */
    G2G_API_BASE_URL?: string
  }
}
