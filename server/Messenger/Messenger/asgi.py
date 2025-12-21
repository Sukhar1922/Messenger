import os

# ОБЯЗАТЕЛЬНО до импортов моделей и middleware
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Messenger.settings")

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from core.middleware import JWTAuthMiddleware
import core.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(core.routing.websocket_urlpatterns)
    ),
})