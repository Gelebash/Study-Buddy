from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import UserSerializer, NoteSerializer, BuddySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Buddy
from datetime import datetime
from rest_framework.views import APIView

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Extract favoritePet and petBirthDate from request data
        favorite_pet = request.data.get('favoritePet')
        pet_birth_date = request.data.get('petBirthDate')

        # Strip timestamp from petBirthDate if present
        if pet_birth_date:
            try:
                pet_birth_date = pet_birth_date.split('T')[0]  # Keep only the date part
                pet_birth_date = datetime.strptime(pet_birth_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

        if favorite_pet or pet_birth_date:
            Buddy.objects.filter(user=serializer.instance).update(
                favoritePet=favorite_pet,
                petBirthDate=pet_birth_date
            )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        user = serializer.save()

class BuddyDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BuddySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.buddy

class BuddyListCreateView(generics.ListCreateAPIView):
    serializer_class = BuddySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Buddy.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BuddyUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            buddy = Buddy.objects.get(user=request.user)
            serializer = BuddySerializer(buddy)
            return Response(serializer.data)
        except Buddy.DoesNotExist:
            return Response({"error": "Buddy not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk=None):
        try:
            buddy = Buddy.objects.get(user=request.user)
            serializer = BuddySerializer(buddy, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Buddy.DoesNotExist:
            return Response({"error": "Buddy not found"}, status=status.HTTP_404_NOT_FOUND)