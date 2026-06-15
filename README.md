# 🎓 Tutoring Platform

A full-stack private tutoring platform built with NestJS (backend) and Angular (frontend).

---

## 📁 Project Structure

```
tutoring-platform/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── config/             # App & DB configuration
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   └── typeorm.config.ts
│   │   ├── common/             # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   ├── modules/            # Feature modules
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── tutor-application/
│   │   │   ├── tutor-profile/
│   │   │   ├── subjects/
│   │   │   ├── advertisements/
│   │   │   ├── time-slots/
│   │   │   ├── bookings/
│   │   │   ├── materials/
│   │   │   ├── reviews/
│   │   │   └── progress/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env                    # Local environment (gitignored)
│   ├── .env.example            # Template (committed)
│   ├── docker-compose.yml      # PostgreSQL + pgAdmin
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                   # Angular App
    ├── src/
    │   ├── app/
    │   │   ├── core/           # App-wide singletons
    │   │   │   ├── guards/
    │   │   │   └── services/
    │   │   ├── shared/         # Reusable components
    │   │   │   ├── components/
    │   │   │   └── pipes/
    │   │   ├── features/       # Page-level feature modules
    │   │   │   ├── auth/
    │   │   │   │   ├── login/
    │   │   │   │   └── register/
    │   │   │   ├── ads/
    │   │   │   ├── booking/
    │   │   │   ├── tutor-profile/
    │   │   │   ├── home/
    │   │   │   └── admin/
    │   │   ├── store/          # NgRx state (future)
    │   │   ├── app.component.*
    │   │   ├── app.config.ts
    │   │   └── app.routes.ts
    │   ├── environments/
    │   │   ├── environment.ts
    │   │   └── environment.prod.ts
    │   ├── styles.scss
    │   ├── index.html
    │   └── main.ts
    ├── angular.json
    ├── proxy.conf.json
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- **Docker** & **Docker Compose**
- **Angular CLI**: `npm install -g @angular/cli`
- **NestJS CLI**: `npm install -g @nestjs/cli`

---

## 🐳 Database Setup (Docker)

```bash
# From the backend directory
cd backend

# Start PostgreSQL + pgAdmin
docker-compose up -d

# Stop
docker-compose down

# Stop and remove volumes (wipes DB data)
docker-compose down -v

# View logs
docker-compose logs -f postgres
```

**pgAdmin** is available at [http://localhost:8080](http://localhost:8080)
- Email: `admin@tutoring.com`
- Password: `admin`
- Connect to server: host=`postgres`, port=`5432`, user=`tutoring_user`, password=`tutoring_pass`

---

## ⚙️ Backend Setup (NestJS)

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start in development (watch mode)
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod
```

API will be running at: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)

---

## 🖥️ Frontend Setup (Angular)

```bash
cd frontend

# Install dependencies
npm install

# Start development server (proxies /api to backend)
npm start

# Build for production
npm run build:prod
```

Frontend will be running at: [http://localhost:4200](http://localhost:4200)

### Routes

| Path | Component |
|------|-----------|
| `/` | Redirects to `/home` |
| `/home` | HomeComponent |
| `/login` | LoginComponent |
| `/register` | RegisterComponent |
| `/ads` | AdsComponent |
| `/booking` | BookingComponent |
| `/tutor-profile` | TutorProfileComponent |
| `/admin` | AdminComponent |

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend && npm run test

# Frontend tests
cd frontend && npm test
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10, TypeScript 5 |
| Database | PostgreSQL 15 |
| ORM | TypeORM 0.3 |
| Frontend | Angular 17 (standalone components) |
| State (planned) | NgRx |
| Auth (planned) | JWT |
| Containerization | Docker Compose |

---

## 📝 Suggested Git Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user registration endpoint
fix: resolve TypeORM connection issue
chore: update dependencies
docs: update API documentation
refactor: extract auth guard to core module
test: add unit tests for BookingsService
```
