# from celery import shared_task
# from .models import Buddy

# @shared_task
# def decrease_pet_happiness():
#     buddies = Buddy.objects.all()
#     for buddy in buddies:
#         if buddy.petHappiness > 0:
#             buddy.petHappiness = max(0, int(buddy.petHappiness * 0.99))
#             buddy.save()