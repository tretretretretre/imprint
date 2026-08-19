# Imprint

A visual consistency studio. Lock a character, place, object, outfit, companion, or art style from a few reference plates, then grow a canon that does not drift.

- **Character / place / object / outfit / companion** — edit from the exact references. Identity stays locked.
- **Style** — learn the art language, then draw *new* images in that style. The grammar stays; the picture does not copy the reference.

## Run it

```bash
npm install
npm run dev
```

Sign in (Google or X), open **Studio**, start a lock.

Production needs `DATABASE_URL` (Postgres / Neon) and `XAI_API_KEY` for generation. See `.env.example`.

```bash
npm run build
```
