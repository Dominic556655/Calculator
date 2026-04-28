from django.urls import path
from . import views
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi


schema_view = get_schema_view(
   openapi.Info(
      title="SaaS Calculator API",
      default_version='v1',
      description="VAT, Mortgage, FBA calculator APIs",
   ),
   public=True,
   permission_classes=[permissions.AllowAny],  # ✅ must be a list of classes
)

urlpatterns = [
   #  path('vat', views.home, name='home'),
    path('vat/', views.vat_page, name='vat-page'),
    path('mortgage/', views.mortgage_page, name='mortgage-page'),
    path('fba/', views.fba_page, name='fba-page'),
    path('history/', views.history_page, name='history-page'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]




