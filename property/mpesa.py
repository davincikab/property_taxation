from datetime import datetime
import json
import base64
import requests
from requests.auth import HTTPBasicAuth

app_name = "Tax assistant"
app_name = "Lipa Tax"

class MpesaC2BCredentials:
    consumer_key = 'nO06kGR7xWS2uhb6Ee3FnYJS0tGvkT0J'
    consumer_secret = 'LDi7LHGefx8h2D3k'
    api_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

# get access token and authentication
class MpesaAccessToken:
    req = requests.get(
        MpesaC2BCredentials.api_URL,
        auth = HTTPBasicAuth(MpesaC2BCredentials.consumer_key, MpesaC2BCredentials.consumer_secret)
    )

    # return the access token
    json_response = json.loads(req.text)
    validated_access_token =json_response['access_token']

# lipa na mpesa
class LipaNaMpesa:
    BusinessShortCode = "174379"
    C2BShortCode = "3848"
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    passKey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"

    password_text = BusinessShortCode + passKey + timestamp
    online_password = base64.b64encode(password_text.encode())
    decode_password = online_password.decode('utf-8')

    
