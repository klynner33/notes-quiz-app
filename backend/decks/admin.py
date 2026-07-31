# Import Django's admin module so we can customize the Django Admin site.
from django.contrib import admin

# Import the Deck and Flashcard models from the current app's models.py file.
from .models import Deck, Flashcard


# Register the Deck model with the Django Admin using the DeckAdmin class below.
@admin.register(Deck)

# Create a custom admin configuration for the Deck model.
# Inherit from ModelAdmin so we can customize how it appears.
class DeckAdmin(admin.ModelAdmin):

    # Specify which fields should be displayed as columns in the Deck list page.
    # The admin will show:
    # Name | User | Created At
    list_display = ("name", "user", "created_at")

    # Add a search box that searches the "name" field.
    search_fields = ("name",)


# Register the Flashcard model with the Django Admin using the FlashcardAdmin class.
@admin.register(Flashcard)

# Create a custom admin configuration for the Flashcard model.
class FlashcardAdmin(admin.ModelAdmin):

    # Display these fields as columns in the Flashcard list page.
    # The admin will show:
    # Front | Deck | Box | Next Review | User
    list_display = ("front", "deck", "box", "next_review_at", "user")

    # Add filter options in the right sidebar.
    # This lets you filter flashcards by Deck or by Leitner Box.
    list_filter = ("deck", "box")

    # Add a search box that searches both the front and back of the flashcards.
    search_fields = ("front", "back")