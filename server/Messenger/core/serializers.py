from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model


User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    login = serializers.CharField()
    nickname = serializers.CharField()
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, data):
        login = data.get('login')
        try:
            user = User.objects.get(login=login)
        except User.DoesNotExist:
            raise serializers.ValidationError({'login': 'Пользователь с таким логином не найден. Обратитесь к администратору.'})

        if user.is_registered:
            raise serializers.ValidationError({'login': 'Этот логин уже завершил регистрацию.'})

        data['user'] = user
        return data

    def create(self, validated_data):
        user = validated_data['user']
        user.nickname = validated_data['nickname']
        user.set_password(validated_data['password'])
        user.is_registered = True
        user.save()

        refresh = RefreshToken.for_user(user)
        user.access = str(refresh.access_token)
        user.refresh = str(refresh)

        return user


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nickname']

class ChatSerializer(serializers.ModelSerializer):
    users = UserSimpleSerializer(many=True)
    last_message = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()
    
    users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True
    )
    last_message = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'chat_name', 'is_private', 'users', 'created_at', 'last_message', 'last_message_time']
        read_only_fields = ['id', 'created_at', 'last_message', 'last_message_time']

    def get_last_message(self, obj):
        msg = obj.message_set.order_by('-writed_at').first()
        return msg.text_content if msg else "Нет сообщений"

    def get_last_message_time(self, obj):
        msg = obj.message_set.order_by('-writed_at').first()
        return msg.writed_at if msg else None


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            'id', 
            'chat', 
            'user', 
            'text_content', 
            'writed_at', 
            'is_read'
        ]
        read_only_fields = [
            "id",
            "chat",
            "user",
            "writed_at",
            "is_read",
        ]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'login', 'nickname', 'created_at', 'last_login']


class ChangeNicknameSerializer(serializers.Serializer):
    nickname = serializers.CharField(max_length=64)

    def update(self, instance, validated_data):
        instance.nickname = validated_data['nickname']
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Неверный текущий пароль.')
        return value

    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance