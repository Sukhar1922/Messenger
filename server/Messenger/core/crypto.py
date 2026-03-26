from cryptography.fernet import Fernet
from django.conf import settings

_fernet = Fernet(settings.FERNET_KEY.encode() if isinstance(settings.FERNET_KEY, str) else settings.FERNET_KEY)

def encrypt(text: str) -> str:
    return _fernet.encrypt(text.encode()).decode()

def decrypt(text: str) -> str:
    return _fernet.decrypt(text.encode()).decode()