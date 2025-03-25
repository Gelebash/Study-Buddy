from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.response import Response  # Import Response
from .serializers import UserSerializer, NoteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        view_preference = self.request.query_params.get('view', 'title')  # Default to 'title'
        if view_preference == 'title+back':
            return Note.objects.filter(author=user).values('title', 'back')
        elif view_preference == 'back':
            return Note.objects.filter(author=user).values('back')
        else:  # Default to 'title'
            return Note.objects.filter(author=user).values('title')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        view_preference = request.query_params.get('view', 'title')  # Default to 'title'

        # Customize the response based on the 'view' parameter
        if view_preference == 'title+back':
            data = list(queryset.values('title', 'back'))  # Convert QuerySet to a list of dictionaries
        elif view_preference == 'back':
            data = list(queryset.values('back'))  # Convert QuerySet to a list of dictionaries
        else:  # Default to 'title'
            data = list(queryset.values('title'))  # Convert QuerySet to a list of dictionaries

        return Response(data)  # Use Response to return the data

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            raise ValueError(serializer.errors)  # Raise an exception for invalid data

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]