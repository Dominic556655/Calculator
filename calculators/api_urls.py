from django.urls import path
from . import views

urlpatterns = [
    path('vat/', views.vat_calculator, name='vat-calculator'),
    path('mortgage/', views.mortgage_calculator, name='mortgage-calculator'),
    path('fba/', views.fba_calculator, name='fba-calculator'),
    # path('history/', views.calculation_history, name='calculation-history'),
    # path('history/clear/', views.clear_history, name='clear-history'),
    path("", views.currency_converter, name="currency_converter"),
    path("api/convert/", views.get_conversion_rate, name="get_conversion_rate"),
]