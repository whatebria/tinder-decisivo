"""Serializers de autenticacion / registro / password reset."""

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )


class PasswordResetRequestSerializer(serializers.Serializer):
    """Payload: solo email."""

    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Payload: token + password nueva."""

    token = serializers.CharField(max_length=200)
    new_password = serializers.CharField(min_length=8, write_only=True)
