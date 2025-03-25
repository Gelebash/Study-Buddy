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
