from rest_framework import serializers

# ===== VAT =====
class VATSerializer(serializers.Serializer):
    amount = serializers.FloatField(min_value=0)
    vat_rate = serializers.FloatField(min_value=0)
    currency = serializers.CharField(required=False)


# ===== Mortgage =====
class MortgageSerializer(serializers.Serializer):
    principal = serializers.FloatField(min_value=0)
    annual_rate = serializers.FloatField(min_value=0)
    years = serializers.IntegerField(min_value=1)
    currency = serializers.CharField(required=False)


# ===== FBA =====
class FBASerializer(serializers.Serializer):
    product_cost = serializers.FloatField(min_value=0)
    selling_price = serializers.FloatField(min_value=0)
    amazon_fee = serializers.FloatField(min_value=0)
    shipping_cost = serializers.FloatField(min_value=0, required=False, default=0)
    currency = serializers.CharField(required=False)
    
    # Advanced mode fields
    referral_fee_percent = serializers.FloatField(min_value=0, required=False, default=0)
    fba_fee = serializers.FloatField(min_value=0, required=False, default=0)
    extra_fee = serializers.FloatField(min_value=0, required=False, default=0)
    use_advanced = serializers.BooleanField(required=False, default=False)