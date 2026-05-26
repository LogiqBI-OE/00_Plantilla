"""URLs de brand per-tenant (montadas bajo /api/brand/)."""
from django.urls import path

from . import views

urlpatterns = [
    path('', views.BrandView.as_view(), name='brand'),
    path('public/', views.BrandPublicView.as_view(), name='brand-public'),
    path('logos/', views.BrandLogosView.as_view(), name='brand-logos'),
    path('logos/<str:kind>/', views.BrandLogoDeleteView.as_view(), name='brand-logo-delete'),
    path('carrusel/foto/', views.BrandCarruselFotoView.as_view(), name='brand-carrusel-foto'),
    path('carrusel/foto/<int:idx>/', views.BrandCarruselFotoDeleteView.as_view(), name='brand-carrusel-foto-delete'),
    path('paleta/memoria/', views.BrandPaletaMemoriaView.as_view(), name='brand-paleta-memoria'),
    path('paleta/memoria/<int:idx>/', views.BrandPaletaMemoriaDeleteView.as_view(), name='brand-paleta-memoria-delete'),
    path('paleta/memoria/<int:idx>/aplicar/', views.BrandPaletaMemoriaAplicarView.as_view(), name='brand-paleta-memoria-aplicar'),
    path('paleta/default/', views.BrandPaletaDefaultView.as_view(), name='brand-paleta-default'),
]
