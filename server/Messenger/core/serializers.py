from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, help_text="Пароль пользователя",)
    access = serializers.CharField(read_only=True,)
    refresh = serializers.CharField(read_only=True,)

    class Meta:
        model = User
        fields = ['id', 'login', 'password', 'nickname', 'access', 'refresh']
        extra_kwargs = {'password_hash': {'write_only': True}}

    def validate_login(self, value):
        if User.objects.filter(login=value).exists():
            raise serializers.ValidationError("Пользователь с таким логином уже существует.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['password_hash'] = make_password(password)
        return super().create(validated_data)
