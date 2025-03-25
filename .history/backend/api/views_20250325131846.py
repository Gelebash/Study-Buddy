from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response  # Import Response
from .serializers import UserSerializer, NoteSerializer, PetSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Pet
from rest_framework.views import APIView


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

    def perform_create(self, serializer):
        user = serializer.save()
        pet_type = self.request.data.get('pet_type', None)
        if pet_type:
            Pet.objects.create(user=user, pet_type=pet_type, stat=50)

class PetDetailView(generics.RetrieveAPIView):
    serializer_class = PetSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.pet

class PetFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        pet = request.user.pet
        pet.stat = min(100, pet.stat + 5)
        pet.save()
        return Response(PetSerializer(pet).data, status=status.HTTP_200_OK)

class PetWaterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        pet = request.user.pet
        pet.stat = min(100, pet.stat + 5)
        pet.save()
        return Response(PetSerializer(pet).data, status=status.HTTP_200_OK)

class PetDailyDeductView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        pet = request.user.pet
        pet.stat = max(0, pet.stat - 10)
        pet.save()
        return Response(PetSerializer(pet).data, status=status.HTTP_200_OK)
