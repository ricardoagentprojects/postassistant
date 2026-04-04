# Estrutura do repositório PostAssistant

Este documento descreve a organização de pastas e ficheiros do projeto (excluindo `node_modules`, `.git`, caches e artefactos de build).

## Visão geral

| Pasta / área | Função |
|--------------|--------|
| `frontend/` | Next.js (páginas, `lib/` para config partilhada, Tailwind). |
| `backend/` | FastAPI, ORM SQLAlchemy, serviços (OpenAI, email), Celery, Alembic. |
| `backend/database/` | Pacote único: `session.py` (engine, `Base`, `get_db`), `__init__.py` re-exporta. |
| `bots/` | Reservado para integrações futuras. |
| `docs/` | Documentação extra (vazio por agora). |
| `.github/workflows/` | CI/CD. |
| Raiz | Docker Compose, Makefile, scripts de deploy, notas. |

## Árvore de ficheiros relevantes

```
.
├── .github/workflows/
│   ├── deploy.yml
│   └── deploy-backup.yml
├── backend/
│   ├── alembic/
│   ├── api/
│   │   ├── auth.py
│   │   ├── content.py
│   │   └── waitlist.py
│   ├── database/
│   │   ├── __init__.py
│   │   └── session.py
│   ├── schemas/
│   │   └── models.py
│   ├── services/
│   │   ├── email.py
│   │   └── openai.py
│   ├── worker/
│   │   ├── celery_app.py
│   │   ├── waitlist.py
│   │   └── schedule.py
│   ├── main.py
│   ├── start.sh
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── components/DashboardApp.jsx
│   ├── lib/apiBase.js
│   ├── lib/apiClient.js
│   ├── pages/
│   ├── styles/
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
├── Makefile
├── README.md
└── STRUCTURE.md
```

## Notas

- **Auth**: JWT com `JWT_SECRET` (ou `SECRET_KEY`); em produção sem segredo definido a app falha ao arrancar (`auth.py`).
- **Frontend**: URL da API via `NEXT_PUBLIC_API_URL` (ver `frontend/.env.example`); não hardcodar URLs de produção no código.
- **OpenAI**: sem `OPENAI_API_KEY`, a geração de conteúdo usa fallback mock (`services/openai.py`).
- **Celery**: `celery_app` só inclui tarefas que existem (`worker.tasks.waitlist`); `load_dotenv()` aplicado no arranque do worker.
- **Modelos**: `User`, `Content` e `Waitlist` estão alinhados entre `schemas/models.py` e os routers; migrações Alembic devem ser geradas quando mudares o schema.

Para comandos de desenvolvimento e deploy, ver `README.md` e `Makefile`.
