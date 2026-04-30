# Django Setup for Digital Educational Resource Library

## 📋 Prerequisites

- Django 4.0+
- Django REST Framework
- PostgreSQL
- Python 3.9+

## 🔧 Installation

### 1. Install Required Packages

```bash
pip install django djangorestframework django-cors-headers python-decouple python-magic
```

### 2. Update Django Settings

Add to `settings.py`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party
    'rest_framework',
    'corsheaders',
    
    # Your apps
    'your_app_name',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Add this
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:3000',
]

# Database Configuration (PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'edulib_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Custom User Model
AUTH_USER_MODEL = 'your_app_name.User'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}

# Media Files (for resource uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Allowed file types for upload
ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt']
MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB
```

### 3. Install Simple JWT

```bash
pip install djangorestframework-simplejwt
```

Add to `INSTALLED_APPS`:
```python
'rest_framework_simplejwt',
```

### 4. Copy Models

1. Copy the content from `django_models.py`
2. Paste it into your Django app's `models.py`
3. Update the `User` model import and references to use your app name

### 5. Create Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Update URLs

Add to your main `urls.py`:

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('your_app_name.urls')),  # Include API routes
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

## 📊 Model Overview

### User Model
- Extends Django's `AbstractUser`
- Adds `role` field: `user` or `admin`
- Controls who can upload vs approve resources

### Resource Model
- `title`: Resource name
- `description`: Detailed info
- `category`: Subject category
- `file`: Uploaded file
- `uploaded_by`: ForeignKey to User
- `status`: PENDING → APPROVED/REJECTED workflow
- `approved_by`: Admin who reviewed it
- `approved_at`: When approval happened
- `download_count`: Tracks popularity
- Helper methods: `approve()`, `reject()`, `increment_download_count()`

### Category Model (Optional)
- Stores available resource categories
- Can be used for better organization

### Download Model (Optional)
- Tracks individual downloads
- Useful for analytics and preventing duplicate counts

## 🔑 Key Features

✅ **Role-based Access**: Users upload, Admins approve
✅ **Status Workflow**: PENDING → APPROVED/REJECTED
✅ **File Management**: Organized upload directory structure
✅ **Download Tracking**: Automatic counting with deduplication
✅ **Timestamps**: Track upload and approval dates
✅ **Indexes**: Database optimization for queries

## ⚙️ Admin Panel

After creating a superuser, you can manage:
- Users and their roles
- Resources (approve/reject)
- Categories
- Downloads

Visit: `http://localhost:8000/admin`

## 🚀 Next Steps

1. ✅ Copy models to your Django app
2. ⏭️ Create serializers (DRF)
3. ⏭️ Create API views/viewsets
4. ⏭️ Set up API URLs and endpoints
5. ⏭️ Test with your React frontend

Need help with serializers or API endpoints?
