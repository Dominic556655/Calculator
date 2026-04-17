from django.shortcuts import render, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib import messages
from .models import Calculation
from .serializers import VATSerializer, MortgageSerializer, FBASerializer
import requests
from django.http import JsonResponse
from pycoingecko import CoinGeckoAPI

# ======================
# Create your views here.
# ======================
# def home(request):
#     return render(request, 'vat.html')
def vat_page(request):
    return render(request, 'vat.html')

def mortgage_page(request):
    return render(request, 'mortgage.html')

def fba_page(request):
    return render(request, 'fba.html')

def history_page(request):
    return render(request, 'history.html')


# ====================
# VAT CALCULATOR VIEW
# ==================
@api_view(['POST'])
@permission_classes([AllowAny])
def vat_calculator(request):
    serializer = VATSerializer(data=request.data)
    if not request.session.session_key:
        request.session.create()
    session_key = request.session.session_key
    
    if serializer.is_valid():
        amount = serializer.validated_data['amount']
        vat = serializer.validated_data['vat']
        currency = request.data.get('currency', 'USD')  # default

        vat_amount = (amount * vat) / 100
        total = amount + vat_amount

        user = request.user if request.user.is_authenticated else None

        Calculation.objects.create(
            user=None,
            session_key=session_key,
            calc_type='VAT',
            input_data={
                "amount": float(amount),
                "vat": float (vat),
                "currency": currency
            },
            result_data={
                "vat_amount":float (vat_amount),
                "total": float (total),
                "currency": currency
            }
        )

        return Response({
            # "success": True,
            "vat_amount":float (vat_amount),
            "total":float (total),
            "currency": currency
        })

    return Response({"success": False, "error": serializer.errors}, status=400)
        
        # ===================
        # MORTGAGE CALCULATOR VIEW
        # ======================
        
@api_view(['POST'])
@permission_classes([AllowAny])
def mortgage_calculator(request):
    serializer = MortgageSerializer(data=request.data)
    if not request.session.session_key:
        request.session.create()
    session_key = request.session.session_key
    
    if serializer.is_valid():
        
        data = serializer.validated_data
        principal = data['principal']
        annual_rate = data['annual_rate']
        years = data['years']
        currency = request.data.get('currency', '₦')

        r_monthly = annual_rate / 12 / 100
        N = years * 12

        if r_monthly == 0:
            monthly_payment = principal / N
        else:
            monthly_payment = principal * (r_monthly * (1 + r_monthly) ** N) / ((1 + r_monthly) ** N - 1)

        total_payment = monthly_payment * N
        total_interest = total_payment - principal

        user = request.user if request.user.is_authenticated else None
        Calculation.objects.create(
            user=None,
            session_key=session_key,
            calc_type='MORTGAGE',
            input_data=data,
            result_data={
                "monthly_payment": round(monthly_payment, 2),
                "total_payment": round(total_payment, 2),
                "total_interest": round(total_interest, 2),
                "currency": currency
            }
        )

        return Response({
            # "success": True,
            "monthly_payment": round(monthly_payment, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2),
            "currency": currency
        })
    return Response({"success": False, "error": serializer.errors}, status=400)

    

# =============
# AMAZON FBA VIEW
# ===================
@api_view(['POST'])
@permission_classes([AllowAny])
def fba_calculator(request):
    serializer = FBASerializer(data=request.data)
    if not request.session.session_key:
        request.session.create()
    session_key = request.session.session_key
    
    if serializer.is_valid():
        data = serializer.validated_data

        product_cost = data['product_cost']
        selling_price = data['selling_price']
        amazon_fee = data['amazon_fee']
        shipping_cost = data.get('shipping_cost', 0)
        currency = request.data.get('currency', '₦')

        amazon_fee_amount = selling_price * (amazon_fee / 100)
        total_cost = product_cost + shipping_cost + amazon_fee_amount
        profit = selling_price - total_cost
        roi = (profit / total_cost * 100) if total_cost != 0 else 0

        user = request.user if request.user.is_authenticated else None
        Calculation.objects.create(
            user=None,
            session_key=session_key,
            calc_type='FBA',
            input_data={
                "product_cost": float(product_cost),
                "selling_price": float(selling_price),
                "amazon_fee": float(amazon_fee),
                "shipping_cost": float(shipping_cost),
                "currency": currency},
            result_data={
                "amazon_fee_amount":float (round(amazon_fee_amount, 2)),
                "total_cost":float (round(total_cost, 2)),
                "profit":float (round(profit, 2)),
                "roi":float (round(roi, 2)),
                "currency": currency
                
            }
        )

        return Response({
            # "success": True,
            "amazon_fee_amount":float (round(amazon_fee_amount, 2)),
            "total_cost":float (round(total_cost, 2)),
            "profit":float (round(profit, 2)),
            "roi":float (round(roi, 2)),
            "currency": currency
            
        })
    return Response({"success": False, "error": serializer.errors}, status=400)
    
    
# ================
# HISTORY
# =================

# @api_view(['GET'])
# @permission_classes([AllowAny])
# def calculation_history(request):
#     calcs = Calculation.objects.all().order_by('-created_at')[:20]

#     data = [
#         {
#             "type": c.calc_type,
#             "result": c.result_data,
#             "date": c.created_at,
#             "currency": c.input_data.get("currency", "") 
#              }
#         for c in calcs
#     ]

#     return Response({"success": True, "history": data})


# @api_view(['DELETE'])
# @permission_classes([AllowAny])

# def clear_history(request):
    
#     Calculation.objects.all().delete()
#     return Response({"message": "Your calculation history has been cleared"}, status=status.HTTP_200_OK)

# ===============
# Currency converter
# ===============
# This renders the HTML template


cg = CoinGeckoAPI()

def currency_converter(request):
    return render(request, "converter.html")

def get_conversion_rate(request):
    amount = request.GET.get("amount")
    base = request.GET.get("base")
    target = request.GET.get("target")

    if not amount or not base or not target:
        return JsonResponse({"error": "Please provide amount, base, and target"}, status=400)

    try:
        amount = float(amount)
    except ValueError:
        return JsonResponse({"error": "Invalid amount"}, status=400)

    # CoinGecko uses lowercase for currency codes
    base_lower = base.lower()
    target_lower = target.lower()

    try:
        data = cg.get_price(ids=base_lower, vs_currencies=target_lower)
        if base_lower not in data or target_lower not in data[base_lower]:
            return JsonResponse({
                "error": f"Failed to fetch rate for {base} → {target}",
                "api_response": data
            }, status=400)

        rate = data[base_lower][target_lower]
        converted_amount = round(amount * rate, 2)

        return JsonResponse({"converted": converted_amount, "rate": rate})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)