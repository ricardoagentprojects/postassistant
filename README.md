# 🚀 PostAssistant - AI Content Assistant for Social Media

**AI-powered content generation, scheduling, and analytics for creators and businesses.**

## 🎯 Overview

PostAssistant helps influencers, restaurants, and small businesses create consistent, engaging social media content using AI. Generate posts, schedule them automatically, and analyze performance—all in one place.

## 📊 Live Status

- **Website:** [PostAssistant.ai](https://postassistant.ai) (temporary)
- **Domain:** `postassistant.pt` (DNS pending)
- **GitHub:** `ricardoagentprojects/postassistant`
- **Vercel:** Auto-deploy configured
- **Status:** MVP Development Phase

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 14 + Tailwind CSS
- **Backend:** FastAPI + PostgreSQL + Redis
- **AI:** OpenAI GPT-4/3.5 + Custom prompts
- **Deployment:** Vercel (frontend) + Railway (backend)
- **Bots:** Telegram + Twitter API integration

### Database Schema
- **Users:** Account management + subscriptions
- **Waitlist:** Early access signups
- **Content:** Generated posts + scheduling
- **Analytics:** Performance metrics
- **APILogs:** Monitoring + billing

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Local Development

```bash
# Clone repository
git clone git@github.com:ricardoagentprojects/postassistant.git
cd postassistant

# Install dependencies
make install

# Start development environment
make dev

# Access services:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
# - Database: localhost:5432
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

## 📁 Project Structure

```
postassistant/
├── frontend/                 # Next.js application
│   ├── pages/               # Next.js pages
│   ├── public/              # Static assets
│   ├── styles/              # CSS/Tailwind
│   └── package.json         # Frontend dependencies
├── backend/                 # FastAPI application
│   ├── api/                 # API endpoints
│   │   ├── waitlist.py      # Waitlist endpoints
│   │   ├── content.py       # Content generation
│   │   └── auth.py          # Authentication
│   ├── database/            # Database configuration
│   ├── schemas/             # SQLAlchemy models
│   ├── services/            # Business logic
│   ├── worker/              # Celery tasks
│   └── main.py              # FastAPI app
├── bots/                    # Telegram/Twitter bots
├── docs/                    # Documentation
├── docker-compose.yml       # Local development
├── Makefile                 # Development commands
└── README.md                # This file
```

## 🔧 Development Commands

```bash
# See all available commands
make help

# Start development environment
make dev

# Run tests
make test

# Format code
make format

# Database migrations
make db-init      # Initialize database
make db-migrate   # Create new migration
make db-upgrade   # Apply migrations

# Linting
make lint

# Clean temporary files
make clean
```

## 🚀 Deployment

### Frontend (Vercel)
The frontend is automatically deployed from the `main` branch to Vercel.

**URL:** https://postassistant.ai (temporary)
**Domain:** postassistant.pt (pending DNS configuration)

### Backend (Railway/Render)

#### Railway Deployment:
1. Push to GitHub
2. Connect Railway to repository
3. Add environment variables:
   - `DATABASE_URL` (PostgreSQL)
   - `REDIS_URL` (Redis)
   - `OPENAI_API_KEY`
   - `SECRET_KEY`
4. Deploy

#### Render Deployment:
1. Connect Render to GitHub
2. Create PostgreSQL database
3. Create web service using `render.yaml`
4. Add environment variables

### Environment Variables
Copy `backend/.env.example` to `backend/.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_URL=redis://host:port/0

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# JWT Secret
SECRET_KEY=your-super-secret-key-change-this

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your-bot-token
```

### Initial Setup
```bash
# 1. Clone and setup
make install

# 2. Start development
make dev

# 3. Initialize database
make db-init

# 4. Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Database: localhost:5432
```

## 📈 Development Roadmap

### Phase 1: MVP (This Week)
- [x] Infrastructure setup (domain, GitHub, Vercel)
- [x] Landing page with waitlist
- [x] Backend API structure
- [ ] Waitlist system (API + database)
- [ ] Basic content generation
- [ ] Telegram bot integration
- [ ] First user testing

### Phase 2: Core Features (Week 2)
- [ ] User dashboard
- [ ] Advanced content generation
- [ ] Post scheduling
- [ ] Twitter integration
- [ ] Basic analytics
- [ ] Payment integration (Stripe)

### Phase 3: Scaling (Month 1)
- [ ] Multi-platform support (Instagram, LinkedIn)
- [ ] Advanced analytics
- [ ] Team collaboration
- [ ] API for developers
- [ ] Mobile app

## 💰 Business Model

### Pricing Tiers
- **Free:** 10 posts/month, basic features
- **Starter ($29/month):** 100 posts/month, scheduling, analytics
- **Pro ($79/month):** 500 posts/month, advanced AI, multi-platform
- **Business ($199/month):** 2000 posts/month, team features, API access

### Target Market
- **Creators & Influencers:** Content consistency
- **Restaurants & Cafés:** Daily specials, promotions
- **Small Businesses:** Brand building, engagement
- **Marketing Agencies:** Client management

## 🔐 Security & Compliance

- **Authentication:** JWT tokens + OAuth2
- **Data Protection:** GDPR compliant
- **Encryption:** Data at rest + in transit
- **Monitoring:** Logging + error tracking
- **Backups:** Daily + weekly rotations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Proprietary - All rights reserved.

## 📞 Contact

- **Website:** [PostAssistant.ai](https://postassistant.ai)
- **Email:** ricardo.agent.projects@gmail.com
- **GitHub:** [ricardoagentprojects](https://github.com/ricardoagentprojects)

---

**Built with ❤️ by RicardoAgent | Following Nat Eliason's scalable business model**