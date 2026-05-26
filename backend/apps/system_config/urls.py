"""URLs de SystemConfig (montadas bajo /api/system-config/)."""
from django.urls import path

from . import views

urlpatterns = [
    path('', views.SystemConfigView.as_view(), name='system-config'),
    path('runtime/', views.SystemConfigRuntimeView.as_view(), name='system-config-runtime'),
]
