from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from .forms import LoginForm, SignupForm

def login_view(request):
    if request.user.is_authenticated:
        return redirect('agent:home')

    form = LoginForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        email = form.cleaned_data['email']
        password = form.cleaned_data['password']
        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
            return redirect('agent:home')
        else:
            form.add_error(None, 'Invalid email or password')

    return render(request, 'accounts/login.html', {'form': form})

def signup_view(request):
    if request.user.is_authenticated:
        return redirect('agent:home')

    form = SignupForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.save()
        login(request, user)
        return redirect('agent:home')

    return render(request, 'accounts/signup.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login')
