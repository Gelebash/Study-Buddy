from django.db import models
from django.contrib.auth.models import User

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



# New Pet model for the virtual pet functionality.
class Pet(models.Model):
    PET_CHOICES = [
        ('cat', 'Cat'),
        ('fish', 'Fish'),
        ('turtle', 'Turtle'),
        ('dog', 'Dog'),
        ('bunny', 'Bunny'),
        ('hamster', 'Hamster'),
        ('reptile', 'Reptile'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pet')
    pet_type = models.CharField(max_length=20, choices=PET_CHOICES)
    # Stat: from 0 (dead) to 100 (fully happy). Defaults to 50.
    stat = models.IntegerField(default=50)

    def __str__(self):
        return f"{self.user.username}'s {self.pet_type}"
