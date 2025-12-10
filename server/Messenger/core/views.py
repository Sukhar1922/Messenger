from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import PermissionDenied

from .models import *
from .serializers import *

from rest_framework import generics

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from drf_spectacular.utils import extend_schema, OpenApiParameter


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class ChatListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer

    def get_queryset(self):
        return Chat.objects.filter(users=self.request.user).order_by("-created_at")


class MessageListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        user = self.request.user
        chat_id = self.kwargs['chat_id']
        
        chat = get_object_or_404(Chat, id=chat_id)

        if not chat.users.filter(id=user.id).exists():
            raise PermissionDenied("Вы не состоите в этом чате.")

        return Message.objects.filter(chat=chat).order_by("writed_at")

class UserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.all().exclude(id=self.request.user.id)
    

class UserView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()


class MeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


@extend_schema(
    parameters=[
        OpenApiParameter(name='q', required=False, type=str, description='Часть введённого nickname')
    ]
)
class UserSearchView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all()
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(nickname__icontains=q)
        return queryset
