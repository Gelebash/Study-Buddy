from django.core.management.base import BaseCommand
from api.models import Pet

class Command(BaseCommand):
    help = 'Decrease each pet\'s stat by 10 every day (minimum stat is 0).'

    def handle(self, *args, **kwargs):
        pets = Pet.objects.all()
        for pet in pets:
            original = pet.stat
            pet.stat = max(0, pet.stat - 10)
            pet.save()
            self.stdout.write(f"Updated {pet.user.username}'s {pet.pet_type}: {original}% -> {pet.stat}%")
        self.stdout.write(self.style.SUCCESS('Successfully updated pet stats for all pets.'))





