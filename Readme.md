# MyTasks — Full-Stack Todo App

A Google Tasks–inspired productivity app with multiple lists, drag-and-drop reordering, and flexible sorting.

**Stack:** React + Vite (frontend) · ASP.NET Core 10 + SQLite (backend)

---

## Features

| Feature | Details |
|---|---|
| Multiple lists | Create, rename, reorder, delete lists |
| Default "My Tasks" | Always present, cannot be deleted |
| Drag-and-drop | Reorder tasks and lists (dnd-kit) |
| Sort modes | My Order · Due Date · Title · Date Added |
| Inline editing | Double-click any task title to edit |
| Due dates | Overdue/today badges with colour coding |
| Completed section | Auto-separated, strike-through |

---

## Project Structure

```
my-fullstack-todoapp/
├── backend/                  # ASP.NET Core 10 Web API
│   ├── Controllers/
│   │   ├── TodoController.cs
│   │   └── TodoListController.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── Models/
│   │   ├── TodoItem.cs
│   │   └── TodoList.cs
│   ├── Dockerfile
│   ├── Program.cs
│   ├── appsettings.json
│   └── backend.csproj
│
└── frontend/                 # React + Vite
    ├── src/
    │   ├── api/todoApi.js
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── TodoCard.jsx
    │   │   ├── TodoForm.jsx
    │   │   └── FilterBar.jsx
    │   ├── context/AppContext.jsx
    │   ├── hooks/useTodos.js
    │   ├── layouts/MainLayout.jsx
    │   ├── pages/Home.jsx
    │   ├── styles/app.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Local Development

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 18+](https://nodejs.org/)

### 1. Backend

```bash
cd backend

# Restore packages
dotnet restore

# Create and apply migrations (first time only)
dotnet ef migrations add InitialCreate
dotnet ef database update

# Run (default port 5025)
dotnet run
```

API will be at `http://localhost:5025`  
Swagger UI at `http://localhost:5025/swagger`

### 2. Frontend

```bash
cd frontend

# Copy env file
cp .env.example .env.local

# Install dependencies
npm install

# Run dev server (port 5173)
npm run dev
```

Open `http://localhost:5173`

> **Note:** Vite proxies `/api` requests to `http://localhost:5025` automatically in dev.

### 3. Add EF Tools (if not installed)

```bash
dotnet tool install --global dotnet-ef
```

---

## API Reference

### Todo Lists

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/todolist` | Get all lists with task counts |
| GET | `/api/todolist/{id}` | Get a single list |
| POST | `/api/todolist` | Create a list `{ name }` |
| PUT | `/api/todolist/{id}` | Update a list |
| DELETE | `/api/todolist/{id}` | Delete list (tasks moved to My Tasks) |
| PUT | `/api/todolist/reorder` | Reorder `[{id, sortOrder}]` |

### Todos

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/todo?listId=1&sort=dueDate` | Get todos (sort: myOrder, dueDate, title, createdAt) |
| GET | `/api/todo/{id}` | Get single todo |
| POST | `/api/todo` | Create todo `{ title, dueDate?, todoListId? }` |
| PUT | `/api/todo/{id}` | Update todo |
| DELETE | `/api/todo/{id}` | Delete todo |
| PUT | `/api/todo/reorder` | Reorder `[{id, sortOrder}]` |

---

## Deployment

---

### Option 1 — Render.com (Easiest Free Tier — Start Here)

#### Backend (Web Service)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, select the `backend/` folder
4. Settings:
   - **Runtime:** Docker
   - **Dockerfile path:** `backend/Dockerfile`
   - **Port:** `5025`
5. Add environment variable: `ASPNETCORE_ENVIRONMENT=Production`
6. Add a **Disk** (persistent storage): Mount path `/data`, 1GB free tier
7. Deploy — copy the service URL (e.g. `https://mytasks-api.onrender.com`)

#### Frontend (Static Site)

1. New → Static Site → connect same repo, select `frontend/`
2. Settings:
   - **Build command:** `npm install && npm run build`
   - **Publish dir:** `dist`
3. Add environment variable: `VITE_API_BASE_URL=https://mytasks-api.onrender.com`
4. Deploy

---

### Option 2 — Vercel (Frontend) + Render (Backend)

#### Backend on Render
Same as above — get your backend URL.

#### Frontend on Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. In the `frontend/` folder:

```bash
# Set env var for production
echo "VITE_API_BASE_URL=https://your-api.onrender.com" > .env.production

# Deploy
vercel --prod
```

Or via Vercel dashboard:
1. New Project → import GitHub repo
2. Set **Root Directory** to `frontend`
3. Add env var: `VITE_API_BASE_URL=https://your-api.onrender.com`
4. Deploy

**CORS:** After deploying, add your Vercel URL to `appsettings.json`:

```json
{
  "AllowedOrigins": [
    "https://your-app.vercel.app"
  ]
}
```

---

### Option 3 — Azure (Production-Grade)

#### Backend — Azure App Service

```bash
cd backend

# Login
az login

# Create resource group
az group create --name todo-rg --location eastus

# Create App Service plan (B1 = ~$13/month)
az appservice plan create \
  --name todo-plan \
  --resource-group todo-rg \
  --sku B1 \
  --is-linux

# Create web app (Docker)
az webapp create \
  --resource-group todo-rg \
  --plan todo-plan \
  --name mytasks-api \
  --deployment-container-image-name mcr.microsoft.com/dotnet/aspnet:10.0

# Create Azure File Share for SQLite persistence
az storage account create --name mytasksstorage --resource-group todo-rg --sku Standard_LRS
az storage share create --name tododata --account-name mytasksstorage

# Mount to /data in the app
az webapp config storage-account add \
  --resource-group todo-rg \
  --name mytasks-api \
  --custom-id tododata \
  --storage-type AzureFiles \
  --share-name tododata \
  --account-name mytasksstorage \
  --mount-path /data \
  --access-key $(az storage account keys list --account-name mytasksstorage --query '[0].value' -o tsv)

# Set env vars
az webapp config appsettings set \
  --resource-group todo-rg \
  --name mytasks-api \
  --settings ASPNETCORE_ENVIRONMENT=Production

# Build and push Docker image
docker build -t mytasks-api ./backend
docker tag mytasks-api <your-acr>.azurecr.io/mytasks-api:latest
docker push <your-acr>.azurecr.io/mytasks-api:latest

# Set the image
az webapp config container set \
  --name mytasks-api \
  --resource-group todo-rg \
  --docker-custom-image-name <your-acr>.azurecr.io/mytasks-api:latest
```

#### Frontend — Azure Static Web Apps

```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Build frontend
cd frontend
VITE_API_BASE_URL=https://mytasks-api.azurewebsites.net npm run build

# Deploy
swa deploy ./dist --env production
```

Or via Azure Portal:
1. Create a **Static Web App** resource
2. Connect GitHub repo, set app location to `frontend`, output to `dist`
3. Add env variable: `VITE_API_BASE_URL=https://mytasks-api.azurewebsites.net`

---

### Option 4 — AWS (Scalable)

#### Backend — AWS App Runner

```bash
# Build and push to ECR
aws ecr create-repository --repository-name mytasks-api

docker build -t mytasks-api ./backend
docker tag mytasks-api:latest <account>.dkr.ecr.<region>.amazonaws.com/mytasks-api:latest

aws ecr get-login-password | docker login --username AWS \
  --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

docker push <account>.dkr.ecr.<region>.amazonaws.com/mytasks-api:latest
```

Then in AWS Console → App Runner → Create Service → select your ECR image.

> **Note:** For production AWS, consider replacing SQLite with **RDS (PostgreSQL)** for reliability. Change the EF provider in `backend.csproj` from `Sqlite` to `Npgsql.EntityFrameworkCore.PostgreSQL` and update the connection string.

#### Frontend — S3 + CloudFront

```bash
cd frontend
VITE_API_BASE_URL=https://your-apprunner-url.awsapprunner.com npm run build

# Create S3 bucket
aws s3 mb s3://mytasks-frontend

# Enable static hosting
aws s3 website s3://mytasks-frontend --index-document index.html --error-document index.html

# Upload
aws s3 sync dist/ s3://mytasks-frontend --delete

# Optionally create a CloudFront distribution pointing to this bucket for HTTPS + CDN
```

---

## Environment Variables Summary

### Backend (`appsettings.json` or env)

| Variable | Description | Example |
|---|---|---|
| `AllowedOrigins` | CORS whitelist (JSON array) | `["https://myapp.vercel.app"]` |
| `ASPNETCORE_ENVIRONMENT` | `Development` or `Production` | `Production` |

### Frontend (`.env.local` or platform env)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `https://mytasks-api.onrender.com` |

---

## Database Migrations

When you add new fields to models:

```bash
cd backend

# Add a migration
dotnet ef migrations add <MigrationName>

# Apply to DB
dotnet ef database update
```

The app auto-runs `db.Database.Migrate()` on startup in production, so new migrations deploy automatically.

---

## Tech Choices & Notes

- **SQLite** is used for simplicity. It works great for personal/small team apps. For high-traffic production use, swap to PostgreSQL (Azure/AWS both offer managed options).
- **dnd-kit** handles drag-and-drop for both lists and tasks with `SortableContext`.
- **SortOrder column** persists "My Order" in the DB. Other sort modes are computed server-side.
- Deleted lists have their tasks **moved to My Tasks** automatically (no orphaned todos).

---

## License

MIT