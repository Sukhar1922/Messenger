from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
import json

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
        chat_id = data.get("chat_id")
        message_text = data.get("text")

        # Ленивый импорт модели пользователя внутри метода
        from django.contrib.auth import get_user_model
        User = get_user_model()

        from .models import Chat, Message

        chat = await database_sync_to_async(Chat.objects.get)(id=chat_id)
        user = await database_sync_to_async(User.objects.get)(id=self.scope["user"].id)

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
                        "text": msg.text_content,
                        "time": msg.writed_at.isoformat()
                    }
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))