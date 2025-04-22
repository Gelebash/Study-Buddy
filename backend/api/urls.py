from django.urls import path
from . import views
from .views import (
    CourseListCreateView, CourseDetailView,
    SectionListCreateView, SectionDetailView,
    PageListCreateView, PageDetailView,
)

urlpatterns = [
    path('note/', views.NoteListCreateView.as_view(), name='note-list-create'),
    path('note/<int:pk>/', views.NoteDetailView.as_view(), name='note-detail'),
    path('buddy/', views.BuddyListCreateView.as_view(), name='buddy-list-create'),
    path('buddy/<int:pk>/', views.BuddyDetailView.as_view(), name='buddy-detail'),
    path('buddy/<int:pk>/update/', views.BuddyUpdateView.as_view(), name='buddy-update'),
    path('courses/', CourseListCreateView.as_view(), name='course-list-create'),
    path('courses/<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('sections/', SectionListCreateView.as_view(), name='section-list-create'),
    path('sections/<int:pk>/', SectionDetailView.as_view(), name='section-detail'),
    path('pages/', PageListCreateView.as_view(), name='page-list-create'),
    path('pages/<int:pk>/', PageDetailView.as_view(), name='page-detail'),
]