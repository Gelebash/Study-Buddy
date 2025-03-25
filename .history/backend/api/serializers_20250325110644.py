from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        # Only allow passwords to be wrote on creation, never read by users.
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'back', 'type', 'created_at', 'author']  # Remove front
        # Read only allows author to be determined, but set at beginning.
        extra_kwargs = {'author': {'read_only': True}}