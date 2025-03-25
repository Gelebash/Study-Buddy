from django.urls import path
from . import views

urlpatterns = [
    path('note/', views.NoteListCreateView.as_view(), name='note-list'),
    path('note/<int:pk>/', views.NoteDelete.as_view(), name='delete-note'),
]