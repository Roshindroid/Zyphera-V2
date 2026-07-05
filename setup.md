# Setup Instructions

Follow these steps to set up the Zyphera-V2 project on your local machine or deploy it to production.

## Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)
- Git

---

## Local Development Setup

### 1. Backend Setup (Django)
Navigate to the backend directory and set up the Python environment:
```bash
cd backend
python -m venv venv
```

Activate the virtual environment:
- **Windows:** `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

Install dependencies:
```bash
pip install -r requirements.txt
```

Apply database migrations and create a superuser:
```bash
python manage.py migrate
python manage.py createsuperuser
```

Run the development server:
```bash
python manage.py runserver
```
The backend API will be available at `http://localhost:8000/`.

### 2. Frontend Setup (React)
Open a new terminal, navigate to the frontend directory:
```bash
cd frontend
```

Install npm dependencies:
```bash
npm install
```

Run the frontend development server:
```bash
npm run dev
```
The React app will be available at `http://localhost:5173/`.

---

## Production Deployment

### Backend (Render)
1. Push your code to GitHub.
2. Create a PostgreSQL database on Render and copy the Internal Database URL.
3. Create a **New Web Service** on Render connected to your repo.
   - **Root Directory:** `backend`
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn zyphera.wsgi:application`
4. Add Environment Variables:
   - `PYTHON_VERSION`: `3.10.0`
   - `SECRET_KEY`: (Your secret key)
   - `DEBUG`: `False`
   - `DATABASE_URL`: (Your PostgreSQL URL)
   - `ALLOWED_HOSTS`: `your-app.onrender.com`
   - `FRONTEND_URL`: `https://your-app.vercel.app` (After deploying frontend)

### Frontend (Vercel)
1. Go to Vercel and import your repository.
2. Set the **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api` (Make sure there is no trailing slash)
4. Click Deploy.
