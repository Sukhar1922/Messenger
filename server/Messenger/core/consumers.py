from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import nh3


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        if not self.scope["user"].is_authenticated:
            await self.close()
            return

        self.user = self.scope["user"]
        self.user_group = f"user_{self.user.id}"  # атрибут создаём только после проверки
        await self.channel_layer.group_add(
            self.user_group,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Проверяем, что атрибут существует
        if hasattr(self, "user_group"):
            await self.channel_layer.group_discard(
                self.user_group,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        # Новое: уведомление о файловом сообщении
        if action == "file_message":
            await self.notify_file_message(data)
            return

        chat_id = data.get("chat_id")
        message_text = data.get("text", "")

        message_text = nh3.clean(message_text, tags=set())

        if not message_text.strip():
            return

        from django.contrib.auth import get_user_model
        User = get_user_model()
        from .models import Chat, Message

        chat = await database_sync_to_async(
            Chat.objects.filter(id=chat_id, users=self.user).first
        )()
        if not chat:
            return

        user = self.user

        msg = await database_sync_to_async(Message.objects.create)(
            chat=chat,
            user=user,
            text_content=message_text
        )

        chat_users = await database_sync_to_async(lambda: list(chat.users.all()))()
        for u in chat_users:
            await self.channel_layer.group_send(
                f"user_{u.id}",
                {
                    "type": "chat_message",
                    "message": {
                        "chat_id": chat.id,
                        "chat_name": chat.chat_name,
                        "user_id": user.id,
                        "user_nickname": user.nickname,
                        "text": msg.decrypted_text,
                        "time": msg.writed_at.isoformat(),
                        "media": []
                    }
                }
            )

    async def notify_file_message(self, data):
        from .models import Chat, Message

        chat_id = data.get("chat_id")
        message_id = data.get("message_id")
        preview_text = data.get("preview_text", "")

        chat = await database_sync_to_async(
            Chat.objects.filter(id=chat_id, users=self.user).first
        )()
        if not chat:
            return

        chat_users = await database_sync_to_async(lambda: list(chat.users.all()))()
        for u in chat_users:
            await self.channel_layer.group_send(
                f"user_{u.id}",
                {
                    "type": "chat_message",
                    "message": {
                        "chat_id": chat.id,
                        "chat_name": chat.chat_name,
                        "user_id": self.user.id,
                        "user_nickname": self.user.nickname,
                        "text": preview_text,
                        "time": data.get("time"),
                        "message_id": message_id,
                        "has_media": True
                    }
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))