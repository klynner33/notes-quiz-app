# Import Django REST Framework's serializer classes.
# Serializers convert Django model objects into JSON and JSON into model objects.
from rest_framework import serializers

# Import the Deck and Flashcard models from the current app.
from .models import Deck, Flashcard


# Create a serializer for the Deck model.
# A ModelSerializer automatically generates serializer fields based on the model.
class DeckSerializer(serializers.ModelSerializer):

    # The Meta class tells Django REST Framework how to build this serializer.
    class Meta:

        # Specify which model this serializer is based on.
        model = Deck

        # List the model fields that should be included in the API.
        fields = [
            "id",              # The deck's unique ID.
            "name",            # The deck's name.
            "description",     # The deck's description.
            "created_at",      # The date/time the deck was created.
        ]

        # These fields can be returned in API responses,
        # but clients cannot change them when creating or updating a deck.
        read_only_fields = ["id", "created_at"]


# Create a serializer for the Flashcard model.
class FlashcardSerializer(serializers.ModelSerializer):

    # Configure how this serializer works.
    class Meta:

        # Specify the model this serializer represents.
        model = Flashcard

        # List all the fields that should be included in the API.
        fields = [
            "id",                 # The flashcard's unique ID.
            "deck",               # The deck this flashcard belongs to.
            "front",              # The front/question side of the flashcard.
            "back",               # The back/answer side of the flashcard.
            "box",                # The current Leitner box.
            "next_review_at",     # When the card should be reviewed next.
            "last_reviewed_at",   # The last time the card was reviewed.
            "created_at",         # When the flashcard was created.
        ]

        # These fields are read-only.
        # The API can return them, but users cannot set or modify them.
        # Your application updates these values automatically.
        read_only_fields = [
            "id",                 # Automatically assigned by the database.
            "box",                # Starts at 1 and changes during reviews.
            "next_review_at",     # Updated automatically by the review logic.
            "last_reviewed_at",   # Updated automatically after each review.
            "created_at",         # Automatically set when the card is created.
        ]

class ReviewRatingSerializer(serializers.Serializer):
    rating = serializers.ChoiceField(choices=["easy", "medium", "hard"])