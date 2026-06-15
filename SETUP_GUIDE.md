# 📘 VS Code + GitHub Setup Guide

Step-by-step instructions for getting your tutoring platform project
into VS Code and connected to a GitHub repository with clean incremental commits.

---

## STEP 1 — Create a GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `tutoring-platform`
3. Set visibility: **Private** (recommended for university projects)
4. ❌ Do NOT initialize with README, .gitignore, or license
   (you already have these locally)
5. Click **Create repository**
6. Copy the remote URL — it will look like:
   `https://github.com/YOUR_USERNAME/tutoring-platform.git`

---

## STEP 2 — Copy Project Files to Your Machine

### Option A — Direct copy (recommended)

Copy the entire `tutoring-platform/` folder to your desired location, e.g.:

```
C:\Users\Stefan\Projects\tutoring-platform\     ← Windows
~/Projects/tutoring-platform/                   ← Mac/Linux
```

### Option B — Create manually from scratch

If you prefer to scaffold with the CLI instead:

```bash
# Backend
npm install -g @nestjs/cli
nest new tutoring-platform-backend
# Then replace the src/ folder and config files with the ones provided

# Frontend
npm install -g @angular/cli
ng new tutoring-platform-frontend --routing=true --style=scss --standalone=true
# Then replace src/app/ with the provided structure
```

---

## STEP 3 — Open in VS Code

```bash
# Open the root project folder
code tutoring-platform/

# Or open each separately in split windows
code tutoring-platform/backend/
code tutoring-platform/frontend/
```

**Recommended VS Code Extensions:**

Install these from the Extensions panel (Ctrl+Shift+X):

- `Angular Language Service` (angular.ng-template)
- `ESLint` (dbaeumer.vscode-eslint)
- `Prettier - Code formatter` (esbenp.prettier-vscode)
- `Docker` (ms-azuretools.vscode-docker)
- `GitLens` (eamodio.gitlens)
- `Thunder Client` (rangav.vscode-thunder-client) ← REST API testing

---

## STEP 4 — Install Dependencies

Open the VS Code terminal (Ctrl+` or Terminal → New Terminal):

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## STEP 5 — Initialize Git and First Commits

From the ROOT folder (`tutoring-platform/`):

```bash
# Initialize git repository
git init

# Set your identity (if not already set globally)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/tutoring-platform.git

# Verify remote
git remote -v
```

---

## STEP 6 — Commit 1: Backend Setup

```bash
# Stage backend files
git add backend/

# Commit
git commit -m "feat(backend): initial NestJS project setup with TypeORM and PostgreSQL

- Scaffold NestJS project with clean modular architecture
- Configure TypeORM with PostgreSQL using environment-based config
- Add docker-compose.yml for PostgreSQL and pgAdmin containers
- Create 11 placeholder feature modules: auth, users, tutor-application,
  tutor-profile, subjects, advertisements, time-slots, bookings,
  materials, reviews, progress
- Add common/ directory structure for filters, guards, interceptors, decorators
- Configure global ValidationPipe, CORS, and API prefix in main.ts
- Add .env.example template for environment variable documentation"
```

---

## STEP 7 — Commit 2: Frontend Setup

```bash
# Stage frontend files
git add frontend/

# Commit
git commit -m "feat(frontend): initial Angular 17 project setup with routing

- Bootstrap Angular 17 app with standalone components architecture
- Configure AppRoutingModule with lazy-loaded routes for all features
- Create feature directory structure: auth, ads, booking,
  tutor-profile, admin, home
- Add placeholder components for all routes: /login, /register,
  /home, /ads, /booking, /tutor-profile, /admin
- Create core/ directory for guards and services (future use)
- Create shared/ directory for reusable components and pipes
- Add store/ directory with NgRx setup documentation (future step)
- Configure proxy.conf.json to forward /api calls to NestJS backend
- Add environment configs for development and production
- Define CSS custom properties (design tokens) in global styles"
```

---

## STEP 8 — Commit 3: Project Root Files

```bash
# Stage root files
git add README.md .gitignore

# Commit
git commit -m "docs: add project README and root .gitignore

- Document full project structure for backend and frontend
- Add getting started instructions for Docker, backend, and frontend
- Add route table and tech stack overview
- Configure root .gitignore to exclude .env files and node_modules"
```

---

## STEP 9 — Push to GitHub

```bash
# Push all commits
git push -u origin main

# If your default branch is 'master' instead of 'main':
git push -u origin master

# Or rename it first:
git branch -M main
git push -u origin main
```

---

## STEP 10 — Verify on GitHub

1. Go to `https://github.com/YOUR_USERNAME/tutoring-platform`
2. You should see all three commits in the history
3. Check that `.env` is NOT visible (only `.env.example` should be there)

---

## 📅 Suggested Commit Schedule for University Evaluation

To demonstrate consistent, incremental work over a month:

| Week | Area | What to commit |
|------|------|---------------|
| **Week 1** | Backend | User entity + TypeORM migration |
| **Week 1** | Backend | Auth module — JWT strategy, login endpoint |
| **Week 2** | Backend | Tutor application module — entity + CRUD |
| **Week 2** | Frontend | Auth feature — login/register forms with ReactiveFormsModule |
| **Week 3** | Backend | Advertisements + time-slots modules |
| **Week 3** | Frontend | NgRx store setup — auth slice (actions, reducer, effects) |
| **Week 3** | Frontend | Ads feature — listing and search |
| **Week 4** | Backend | Bookings + reviews modules |
| **Week 4** | Frontend | Booking feature + tutor profile page |
| **Week 4** | Both | Integration, testing, final polish |

> **Tip:** Even small commits like "fix: correct typo in module import" or
> "style: apply consistent spacing to auth component" count as activity
> and make your history look natural.

---

## 🔑 Key Commands Reference

```bash
# Start everything for development
cd backend && docker-compose up -d    # Start DB
cd backend && npm run start:dev       # Start API (port 3000)
cd frontend && npm start              # Start UI (port 4200)

# Check git log
git log --oneline --graph

# Create a new feature branch
git checkout -b feat/user-entity

# Merge back to main
git checkout main
git merge feat/user-entity
git push origin main
```
