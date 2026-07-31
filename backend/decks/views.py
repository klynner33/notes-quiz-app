from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Deck, Flashcard
from .serializers import DeckSerializer, FlashcardSerializer, ReviewRatingSerializer
from .srs import apply_rating


# Create a ViewSet for the Deck model.
# ModelViewSet automatically provides:
# GET (list)
# GET (single item)
# POST
# PUT/PATCH
# DELETE
class DeckViewSet(viewsets.ModelViewSet):

    # Only authenticated (logged-in) users can access these endpoints.
    permission_classes = [permissions.IsAuthenticated]

    # Tell the ViewSet to use the DeckSerializer.
    serializer_class = DeckSerializer

    # Return the queryset (database records) for this ViewSet.
    def get_queryset(self):

        # Only return decks that belong to the currently logged-in user.
        # order_by("-created_at") sorts newest decks first.
        return Deck.objects.filter(user=self.request.user).order_by("-created_at")

    # Called automatically whenever a new deck is created.
    def perform_create(self, serializer):

        # Save the new deck and automatically assign ownership
        # to the currently logged-in user.
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["get"])
    def study(self, request, pk=None):
        """
        GET /api/decks/{id}/study/
        Returns cards due for review in this deck.
        Optional: ?limit=20
        """
        deck = self.get_object()  # already limited to this user's decks

        due_cards = (
            deck.cards.filter(
                user=request.user,
                next_review_at__lte=timezone.now(),
            )
            .order_by("next_review_at")
        )

        limit = request.query_params.get("limit")
        if limit is not None:
            try:
                due_cards = due_cards[: int(limit)]
            except ValueError:
                return Response(
                    {"detail": "limit must be an integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = FlashcardSerializer(due_cards, many=True)
        return Response(serializer.data)


# Create a ViewSet for the Flashcard model.
class FlashcardViewSet(viewsets.ModelViewSet):

    # Require users to be logged in.
    permission_classes = [permissions.IsAuthenticated]

    # Use the FlashcardSerializer.
    serializer_class = FlashcardSerializer

    # Return the flashcards this user is allowed to see.
    def get_queryset(self):

        # Only return flashcards owned by the logged-in user.
        # select_related("deck") also loads the related deck
        # in the same database query for better performance.
        return Flashcard.objects.filter(user=self.request.user).select_related("deck")

    # Private helper function that checks whether a deck belongs to the user.
    # The leading underscore (_) is a Python convention that means
    # "this method is intended for internal use only."
    def _validate_deck_belongs_to_user(self, deck):

        # Compare the deck owner's ID with the logged-in user's ID.
        if deck.user_id != self.request.user.id:

            # If they don't match, stop the request and return an error.
            raise ValidationError("You can only create/update cards in your own decks.")

    # Called automatically whenever a new flashcard is created.
    def perform_create(self, serializer):

        # Get the deck that was submitted in the request.
        deck = serializer.validated_data["deck"]

        # Make sure the deck belongs to the logged-in user.
        self._validate_deck_belongs_to_user(deck)

        # Save the flashcard and automatically assign ownership
        # to the logged-in user.
        serializer.save(user=self.request.user)

    # Called automatically whenever a flashcard is updated.
    def perform_update(self, serializer):

        # If the user changes which deck the flashcard belongs to,
        # make sure the new deck is also theirs.
        deck = serializer.validated_data.get("deck")

        # Only perform the validation if a new deck was provided.
        if deck is not None:

            # Verify ownership of the new deck.
            self._validate_deck_belongs_to_user(deck)

        # Save the updated flashcard.
        serializer.save()

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        """
        POST /api/cards/{id}/review/
        Body: { "rating": "easy" | "medium" | "hard" }
        """
        card = self.get_object()  # already limited to this user's cards

        serializer = ReviewRatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        rating = serializer.validated_data["rating"]

        try:
            apply_rating(card, rating)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(FlashcardSerializer(card).data)