from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions
from .serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    # Required: your project defaults to IsAuthenticated
    permission_classes = [permissions.AllowAny]