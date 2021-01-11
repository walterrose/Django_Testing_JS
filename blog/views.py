from django.shortcuts import render

def about(request):
    return render(request,'blog/about.html',)

def home(request):
    return render(request,'blog/base.html',)





