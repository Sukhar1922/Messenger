from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, login, password=None, **extra_fields):
        if not login:
            raise ValueError("Login обязателен")

        user = self.model(login=login, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, login, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("superuser must have is_superuser=True.")

        return self.create_user(login, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    login = models.CharField(max_length=32, unique=True)
    nickname = models.CharField(max_length=64)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f'Пользователь {self.login}'


class Chat(models.Model):
    id = models.AutoField(primary_key=True)
    users = models.ManyToManyField(to=User, related_name='chat')
    is_private = models.BooleanField(default=True)
    chat_name = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Чат {self.chat_name}'


# class User_Chat(models.Model):
#     id = models.AutoField(primary_key=True)
#     user = models.ForeignKey(to=User, on_delete=models.SET_NULL, null=True)
#     chat = models.ForeignKey(to=Chat, on_delete=models.CASCADE)



class Message(models.Model):
    id = models.AutoField(primary_key=True)
    chat = models.ForeignKey(to=Chat, on_delete=models.CASCADE)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    text_content = models.TextField()
    writed_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f'Сообщение от {self.user.nickname}'

