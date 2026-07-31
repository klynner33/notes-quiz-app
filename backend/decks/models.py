# Import the project's settings to access the user model
from django.conf import settings
# Import Django's model classes (CharField, ForeignKey, TextField, etc.)
from django.db import models
# Import Django's timezone utilities for working with dates and times
from django.utils import timezone

# Create a database table named Deck
class Deck(models.Model):

    # Create a relationship between this deck and a user.
    # Each deck belongs to one user.
    # If the user is deleted, all of their decks are deleted too.
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # A short text field that stores the deck's name.
    # Maximum length is 200 characters.
    name = models.CharField(max_length=200)

    # A longer text field for an optional description.
    # blank=True means it is not required.
    description = models.TextField(blank=True)

    # Automatically stores the date and time when the deck is first created.
    created_at = models.DateTimeField(auto_now_add=True)

    # Controls how this object is displayed in places like the Django Admin.
    def __str__(self):

        # Return the deck's name instead of "Deck object (1)" when displaying a deck.
        return self.name

# Create a database table named Flashcard
class Flashcard(models.Model):

    # Each flashcard belongs to one user.
    # If the user is deleted, their flashcards are deleted too.
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Each flashcard belongs to one deck.
    # related_name="cards" lets us access all cards from a deck using:
    # deck.cards.all()
    # If the deck is deleted, all its flashcards are deleted too.
    deck = models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name="cards"
    )

    # Stores the front/question side of the flashcard.
    front = models.TextField()

    # Stores the back/answer side of the flashcard.
    back = models.TextField()

    # -------------------------------
    # Fields used for spaced repetition
    # (Leitner learning system)
    # -------------------------------

    # Stores which Leitner box the card is currently in.
    # New cards always start in Box 1.
    box = models.PositiveSmallIntegerField(default=1)

    # Stores the next date/time this card should be reviewed.
    # New cards default to the current date and time.
    next_review_at = models.DateTimeField(default=timezone.now)

    # Stores the last time the card was reviewed.
    # null=True allows the database to store no value.
    # blank=True allows forms to leave it empty.
    last_reviewed_at = models.DateTimeField(null=True, blank=True)

    # Automatically stores when the flashcard was first created.
    created_at = models.DateTimeField(auto_now_add=True)

    # Controls how the flashcard appears in places like the Django Admin.
    def __str__(self):

        # Return the first 50 characters of the front of the card.
        # [:50] is Python slicing and prevents very long text from being displayed.
        return self.front[:50]
