"""
Digital Educational Resource Library Django Models
Add this to your Django app's models.py
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    """Extended User model with role field"""
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='user',
        help_text='User role: regular user or admin'
    )
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


class Category(models.Model):
    """Resource categories"""
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text='Category name'
    )
    description = models.TextField(
        blank=True,
        help_text='Category description'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Resource(models.Model):
    """Educational resource model"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    # Basic Information
    title = models.CharField(
        max_length=255,
        help_text='Resource title'
    )
    description = models.TextField(
        help_text='Detailed description of the resource'
    )
    category = models.CharField(
        max_length=100,
        help_text='Resource category'
    )
    
    # File
    file = models.FileField(
        upload_to='resources/%Y/%m/%d/',
        help_text='Resource file'
    )
    
    # User Information
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='uploaded_resources',
        help_text='User who uploaded the resource'
    )
    
    # Status & Approval
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING',
        help_text='Resource approval status'
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_resources',
        help_text='Admin who approved the resource'
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='When the resource was uploaded'
    )
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the resource was approved'
    )
    
    # Analytics
    download_count = models.IntegerField(
        default=0,
        help_text='Number of times downloaded'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['uploaded_by']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
    
    def approve(self, admin_user):
        """Approve the resource"""
        self.status = 'APPROVED'
        self.approved_by = admin_user
        self.approved_at = timezone.now()
        self.save()
    
    def reject(self):
        """Reject the resource"""
        self.status = 'REJECTED'
        self.save()
    
    def increment_download_count(self):
        """Increment download count"""
        self.download_count += 1
        self.save(update_fields=['download_count'])


class Download(models.Model):
    """Track resource downloads"""
    
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='downloads'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='downloads'
    )
    downloaded_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='IP address of downloader'
    )
    
    class Meta:
        ordering = ['-downloaded_at']
        unique_together = [['resource', 'user', 'downloaded_at']]
        indexes = [
            models.Index(fields=['resource']),
            models.Index(fields=['user']),
            models.Index(fields=['-downloaded_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} downloaded {self.resource.title}"
