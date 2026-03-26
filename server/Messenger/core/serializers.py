from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from django.conf import settings


User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    login = serializers.CharField()
    nickname = serializers.CharField()
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    IS_OPEN_REG = settings.IS_OPEN_REGISTRATION

    def validate(self, data):
        print(self.IS_OPEN_REG)
        if self.IS_OPEN_REG:
            print('==========')
            data['user'] = User.objects.create_user(login=data['login'])
            return data

        login = data.get('login')
        try:
            user = User.objects.get(login=login)
        except User.DoesNotExist:
            print('Пользователь с таким логином не найден. Обратитесь к администратору.')
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
        return msg.decrypted_text if msg else "Нет сообщений"

    def get_last_message_time(self, obj):
        msg = obj.message_set.order_by('-writed_at').first()
        return msg.writed_at if msg else None


class MessageSerializer(serializers.ModelSerializer):
    text_content = serializers.SerializerMethodField()

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

    def get_text_content(self, obj):
        return obj.decrypted_text

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'login', 'nickname', 'created_at', 'last_login', 'avatar_url']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None


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


class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['avatar']

    def validate_avatar(self, value):
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        max_size = 5 * 1024 * 1024  # 5 МБ

        if value.content_type not in allowed_types:
            raise serializers.ValidationError('Допустимые форматы: JPEG, PNG, WEBP.')

        if value.size > max_size:
            raise serializers.ValidationError('Файл не должен превышать 5 МБ.')

        return value