from django.urls import path
from . import views

urlpatterns = [
    path('note/', views.NoteListCreateView.as_view(), name='note-list-create'),
    path('note/<int:pk>/', views.NoteDetailView.as_view(), name='note-detail'),
    path('buddy/', views.BuddyListCreateView.as_view(), name='buddy-list-create'),
    path('buddy/<int:pk>/', views.BuddyDetailView.as_view(), name='buddy-detail'),
    path('buddy/<int:pk>/update/', views.BuddyUpdateView.as_view(), name='buddy-update'),
]