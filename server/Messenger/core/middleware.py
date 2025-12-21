from urllib.parse import parse_qs
from channels.db import database_sync_to_async
import jwt
from django.conf import settings

@database_sync_to_async
def get_user(user_id):
    from django.contrib.auth import get_user_model
    from django.contrib.auth.models import AnonymousUser
    User = get_user_model()
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "websocket":
            from django.contrib.auth.models import AnonymousUser  # ленивый импорт
            query_string = scope.get("query_string", b"").decode()
            query = parse_qs(query_string)
            token = query.get("token")
            if token:
                try:
                    payload = jwt.decode(token[0], settings.SECRET_KEY, algorithms=["HS256"])
                    user_id = payload.get("user_id")
                    scope["user"] = await get_user(user_id)
                except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                    scope["user"] = AnonymousUser()
            else:
                scope["user"] = AnonymousUser()
        return await self.app(scope, receive, send)