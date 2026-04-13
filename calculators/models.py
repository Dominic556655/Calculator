from django.db import models
from django.contrib.auth.models import User


# ===================
# Create your models here.
# ====================


class Calculation(models.Model):
    CALC_TYPES = [
        ('VAT', 'VAT'),
        ('MORTGAGE', 'Mortgage'),
        ('FBA', 'Amazon FBA'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calculations', null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    calc_type = models.CharField(max_length=20, choices=CALC_TYPES)
    input_data = models.JSONField()   # store inputs like amount, rate, etc.
    result_data = models.JSONField()  # store results like total, profit, monthly_payment
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):        
        username = self.user.username if self.user else "Anonymous"
        return f"{username} - {self.calc_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    