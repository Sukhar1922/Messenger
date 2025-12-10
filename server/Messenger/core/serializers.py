from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'login', 'password', 'nickname', 'access', 'refresh']

    def create(self, validated_data):
        password = validated_data.pop('password')

        # Создаем пользователя стандартно
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Генерируем JWT
        refresh = RefreshToken.for_user(user)

        # Добавляем токены в сериализатор
        user.access = str(refresh.access_token)
        user.refresh = str(refresh)

        return user


class ChatSerializer(serializers.ModelSerializer):
    users = serializers.StringRelatedField(many=True)

    class Meta:
        model = Chat
        fields = ['id', 'chat_name', 'is_private', 'users', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'chat', 'user', 'text_content', 'writed_at', 'is_read']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'login', 'nickname', 'created_at', 'last_login']
