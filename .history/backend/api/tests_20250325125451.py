from django.test import TestCase

# Create your tests here.




from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from api.models import Pet

class PetAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pass1234')
        self.client.login(username='testuser', password='pass1234')
    
    def test_create_pet(self):
        url = reverse('pet-create')
        data = {'pet_type': 'cat'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Pet.objects.count(), 1)
        self.assertEqual(Pet.objects.first().pet_type, 'cat')

    def test_feed_pet(self):
        # Create pet first.
        Pet.objects.create(user=self.user, pet_type='dog', stat=90)
        url = reverse('pet-feed')
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['stat'], 95)
    
    def test_water_pet_max_cap(self):
        Pet.objects.create(user=self.user, pet_type='dog', stat=98)
        url = reverse('pet-water')
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['stat'], 100)
