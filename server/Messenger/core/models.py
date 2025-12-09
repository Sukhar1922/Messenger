from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):
    login = models.CharField(max_length=32, unique=True)
    nickname = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = []   # при создании суперпользователя будут спрашивать только логин + пароль

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

