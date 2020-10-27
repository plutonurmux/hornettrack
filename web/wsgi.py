"""
WSGI config for web project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
# in document however seems useless...
# from whitenoise import WhiteNoise

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "web.settings.local")

application = get_wsgi_application()
