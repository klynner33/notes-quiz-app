# Space Repetition System

from datetime import timedelta

from django.utils import timezone

# How many days to wait before reviewing again, based on Leitner box
INTERVALS_DAYS = {
    1: 1,
    2: 3,
    3: 7,
    4: 14,
    5: 30,
}

MIN_BOX = 1
MAX_BOX = 5

VALID_RATINGS = {"easy", "medium", "hard"}


def apply_rating(card, rating: str):
    """
    Update a flashcard's SRS fields based on easy / medium / hard.

  - hard   -> move down one box (min box 1)
  - medium -> stay in same box
  - easy   -> move up one box (max box 5)

    Then set next_review_at based on the card's box.
    """
    rating = rating.lower().strip()

    if rating not in VALID_RATINGS:
        raise ValueError(f"Invalid rating '{rating}'. Must be easy, medium, or hard.")

    if rating == "hard":
        card.box = max(MIN_BOX, card.box - 1)
    elif rating == "easy":
        card.box = min(MAX_BOX, card.box + 1)
    # medium: box stays the same

    days = INTERVALS_DAYS[card.box]
    now = timezone.now()

    card.next_review_at = now + timedelta(days=days)
    card.last_reviewed_at = now
    card.save()

    return card