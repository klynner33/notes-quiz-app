from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "password"]

    def create(self, validated_data):
        # Hashes the password correctly
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )