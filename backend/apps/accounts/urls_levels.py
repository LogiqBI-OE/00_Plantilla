"""URLs de niveles y matriz (montadas bajo /api/levels/)."""
from django.urls import path

from . import views_levels

urlpatterns = [
    path('', views_levels.LevelsView.as_view(), name='levels-list'),
    path('matrix/', views_levels.MatrixView.as_view(), name='levels-matrix'),
    path('<int:level>/', views_levels.LevelDetailView.as_view(), name='level-detail'),
]
