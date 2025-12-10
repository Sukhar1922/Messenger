from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import *


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('chats/', ChatListView.as_view(), name='chat_list'),
    path('chats/<int:chat_id>/messages', MessageListView.as_view(), name='message_list'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('user/search/', UserSearchView.as_view(), name='user_search'),
    path('user/<int:pk>/', UserView.as_view(), name='user'),
    path('user/me/', MeView.as_view(), name='user_me'),  
]