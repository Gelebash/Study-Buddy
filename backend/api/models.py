from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# The basis of flashcards.
class Note(models.Model):
    title = models.CharField(max_length=100)
    back = models.TextField()
    # Allows grouping of flashcard types.
    type = models.CharField(max_length=100, default = 'general')
    created_at = models.DateTimeField(auto_now_add=True)
    # Foreign key links to user, cascade deletes all associated notes on user deletion.
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')

    def __str__(self):
        return self.title

class Buddy(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='buddy')
    favoritePet = models.CharField(max_length=50, blank=True, null=True)
    firstName = models.CharField(max_length=100, blank=True, null=True)
    middleName = models.CharField(max_length=100, blank=True, null=True)
    lastName = models.CharField(max_length=100, blank=True, null=True)
    stateName = models.CharField(max_length=100, blank=True, null=True)
    countryName = models.CharField(max_length=100, blank=True, null=True)
    petHappiness = models.IntegerField(default=50)
    petBirthDate = models.DateField(null=True, blank=True)
    petIdNumber = models.CharField(max_length=100, blank=True, null=True)
    last_session = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username}'s Buddy"

class Course(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Section(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Page(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='pages')
    title = models.CharField(max_length=100)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
