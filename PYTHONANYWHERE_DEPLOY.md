# PythonAnywhere Deployment Guide for Edu Resource Library

This guide explains how to deploy the full-stack Educational Resource Library (Django + React) to PythonAnywhere.

## Phase 1: Prepare the Code
I have already updated the code to support production deployment:
- **Backend**: Added `whitenoise` for static file serving and configured `settings.py` to serve the React frontend build.
- **Frontend**: Updated the API base URL to use environment variables.

## Phase 2: PythonAnywhere Setup

### 1. Upload your code
- Zip the project and upload it to PythonAnywhere via the "Files" tab.
- Or, use `git clone` in the Bash console.

### 2. Create a Virtual Environment
In the PythonAnywhere Bash console:
```bash
cd ~/your-project-folder/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Build the Frontend
Since PythonAnywhere doesn't easily run Node.js for building, you should build it **locally** first:
- Run `npm run build` in the `frontend` folder on your local machine.
- Ensure the `frontend/dist` folder is uploaded to PythonAnywhere.

### 4. Configure the Web App
Go to the **"Web"** tab on PythonAnywhere:
- Click "Add a new web app".
- Choose "Manual configuration" and select the appropriate Python version (e.g., 3.10).
- **Code section**:
    - Source code: `/home/yourusername/your-project-folder/backend`
    - Working directory: `/home/yourusername/your-project-folder/backend`
- **Virtualenv section**:
    - Path: `/home/yourusername/your-project-folder/backend/venv`

### 5. WSGI Configuration
Click the link to the "WSGI configuration file" and replace its content with:
```python
import os
import sys

# Add your project directory to the sys.path
path = '/home/yourusername/your-project-folder/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### 6. Static Files and Database
In the Bash console:
```bash
# Set environment variables (or create a .env file)
export DEBUG=False
export ALLOWED_HOSTS=yourusername.pythonanywhere.com
export USE_SQLITE=True # Use SQLite for simplicity, or configure PostgreSQL/MySQL

# Run migrations and collect static files
python manage.py migrate
python manage.py collectstatic
```

### 7. Finalize
- Reload your web app from the Web tab.
- Your app should now be live at `https://yourusername.pythonanywhere.com`.

## Environment Variables (.env)
Create a `.env` file in the `backend/` directory on PythonAnywhere:
```env
SECRET_KEY=your-random-secret-key
DEBUG=False
ALLOWED_HOSTS=yourusername.pythonanywhere.com
USE_SQLITE=True
VITE_API_BASE_URL=https://yourusername.pythonanywhere.com/api
```
