from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, Buddy, Course, Section, Page

class BuddySerializer(serializers.ModelSerializer):
    class Meta:
        model = Buddy
        fields = ['favoritePet', 'firstName', 'middleName', 'lastName', 'stateName', 'countryName', 'petHappiness', 'petBirthDate', 'petIdNumber']
        extra_kwargs = {
            'firstName': {'required': False},
            'middleName': {'required': False},
            'lastName': {'required': False},
            'stateName': {'required': False},
            'countryName': {'required': False},
            'petIdNumber': {'required': False},
        }

class UserSerializer(serializers.ModelSerializer):
    buddy = BuddySerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'buddy']  # Removed favoritePet and petBirthDate
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Buddy.objects.create(user=user)  # Buddy will handle favoritePet and petBirthDate
        return user
    
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'back', 'type', 'created_at', 'author']  # Remove front
        # Read only allows author to be determined, but set at beginning.
        extra_kwargs = {'author': {'read_only': True}}

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ['id', 'title', 'section', 'content', 'created_at']
        read_only_fields = ['created_at']

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'name', 'course', 'created_at']
        read_only_fields = ['created_at']

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']