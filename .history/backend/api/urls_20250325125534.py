from django.urls import path
from . import views

urlpatterns = [
    path('note/', views.NoteListCreateView.as_view(), name='note-list'),
    path('note/<int:pk>/', views.NoteDelete.as_view(), name='delete-note'),
    
    path('pet/create/', views.PetCreateView.as_view(), name='pet-create'),
    path('pet/', views.PetDetailView.as_view(), name='pet-detail'),
    path('pet/feed/', views.PetFeedView.as_view(), name='pet-feed'),
    path('pet/water/', views.PetWaterView.as_view(), name='pet-water'),
]