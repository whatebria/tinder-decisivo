"""Serializers de autenticacion / registro / password reset."""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate(self, data):
        """Valida la password contra AUTH_PASSWORD_VALIDATORS de Django.

        Construye un User temporal (sin guardar) para que
        UserAttributeSimilarityValidator pueda comparar contra username/email.
        """
        temp_user = User(
            username=data.get("username", ""),
            email=data.get("email", ""),
        )
        try:
            validate_password(data["password"], user=temp_user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc
        return data

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
    """Payload: token + password nueva.

    Sin min_length aqui: la politica real la aplica validate_password() en
    services/password_reset.py (fuente unica de verdad = AUTH_PASSWORD_VALIDATORS).
    """

    token = serializers.CharField(max_length=200)
    new_password = serializers.CharField(write_only=True)
