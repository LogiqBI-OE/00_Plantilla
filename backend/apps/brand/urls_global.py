"""URLs del GlobalBrand singleton (montadas bajo /api/global-brand/)."""
from django.urls import path

from . import views

urlpatterns = [
    path('', views.GlobalBrandView.as_view(), name='global-brand'),
]
