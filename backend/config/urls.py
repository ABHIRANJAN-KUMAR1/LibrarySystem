from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.views.generic import TemplateView
from django.urls import re_path

urlpatterns = [
    # Django built-in admin panel
    path('django-admin/', admin.site.urls),

    # API routes — accounts (register, login, logout, me, token/refresh)
    path('api/', include('apps.accounts.urls')),

    # API routes — resources (browse, upload, my-uploads, download, admin ops)
    path('api/', include('apps.resources.urls')),

    # Catch-all to serve React frontend
    path('', TemplateView.as_view(template_name='index.html')),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# ─── Customize admin site branding ───────────────────────────────────────────
admin.site.site_header  = 'Edu Resource Library — Admin'
admin.site.site_title   = 'DERL Admin'
admin.site.index_title  = 'Welcome to the DERL Admin Panel'
