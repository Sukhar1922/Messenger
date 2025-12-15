from django.shortcuts import render

# Create your views here.

def test(request):
    return render(request, 'frontend/test.html')


def base(request):
    return render(request, 'frontend/base.html')


def login_view(request):
    return render(request, 'frontend/login.html')


def register_view(request):
    return render(request, 'frontend/register.html')
