from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import DeckViewSet, FlashcardViewSet

router = DefaultRouter()
router.register(r"decks", DeckViewSet, basename="deck")
router.register(r"cards", FlashcardViewSet, basename="card")

urlpatterns = [
    path("", include(router.urls)),
]