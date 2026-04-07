from django.urls import path
from . import views

app_name = 'agent'

urlpatterns = [
    path('', views.home, name='home'),
]