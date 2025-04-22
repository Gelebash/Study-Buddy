from django.contrib import admin
from .models import Note, Buddy, Course, Section, Page  # Import the models

# Register the Note model
@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'back', 'type', 'author', 'created_at')  # Fields to display in the admin list view
    search_fields = ('title', 'back', 'type', 'author__username')  # Fields to enable search functionality
    list_filter = ('type', 'author')  # Fields to filter by in the admin interface

# Register the Buddy model
@admin.register(Buddy)
class BuddyAdmin(admin.ModelAdmin):
    list_display = ('user', 'favoritePet', 'firstName', 'middleName', 'lastName', 'stateName', 'countryName', 'petHappiness', 'petBirthDate', 'petIdNumber')  # Fields to display in the admin list view
    search_fields = ('user__username', 'favoritePet', 'firstName', 'lastName', 'stateName', 'countryName')  # Fields to enable search functionality
    list_filter = ('stateName', 'countryName')  # Fields to filter by in the admin interface

# Register the Course model
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')  # Fields to display in the admin list view
    search_fields = ('name', 'user__username')  # Fields to enable search functionality

# Register the Section model
@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'created_at')  # Fields to display in the admin list view
    search_fields = ('name', 'course__name')  # Fields to enable search functionality

# Register the Page model
@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'created_at')  # Fields to display in the admin list view
    search_fields = ('title', 'section__name')  # Fields to enable search functionality
