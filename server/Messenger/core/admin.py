from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from .models import User, Chat, Message

# Register your models here.

class UserCreationForm(forms.ModelForm):
    """Форма создания пользователя админом — только логин, без пароля"""
    class Meta:
        model = User
        fields = ('login',)

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_unusable_password()  # Пароль не задан — войти нельзя до дорегистрации
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('login', 'nickname', 'is_active', 'is_staff', 'is_registered')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = UserCreationForm
    form = UserChangeForm

    list_display = ('login', 'nickname', 'is_registered', 'is_active', 'is_staff')
    list_filter = ('is_registered', 'is_active', 'is_staff')

    # Поля при редактировании существующего пользователя
    fieldsets = (
        (None, {'fields': ('login', 'nickname')}),
        ('Статус', {'fields': ('is_active', 'is_staff', 'is_registered')}),
        ('Права', {'fields': ('groups', 'user_permissions')}),
    )

    # Поля при создании нового пользователя
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('login',),
        }),
    )

    search_fields = ('login', 'nickname')
    ordering = ('login',)
    filter_horizontal = ('groups', 'user_permissions')
    
admin.site.register(Chat)
admin.site.register(Message)

