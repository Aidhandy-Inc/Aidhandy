import { NextResponse } from 'next/server';

const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api.sandbox.paypal.com';
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(request) {
  try {
    const { token: orderId, payerId } = await request.json();
    
    const accessToken = await getPayPalAccessToken();

    // Capture the payment
    const captureResponse = await fetch(
      `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation',
        },
      }
    );

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      console.error('PayPal Capture Error:', captureData);
      return NextResponse.json(
        { error: captureData.message || 'Failed to capture payment' },
        { status: captureResponse.status }
      );
    }

    // Extract relevant payment information
    const purchaseUnit = captureData.purchase_units[0];
    const payment = purchaseUnit.payments.captures[0];

    return NextResponse.json({
      id: captureData.id,
      status: captureData.status,
      amount: payment.amount.value,
      currency: payment.amount.currency_code,
      createTime: captureData.create_time,
      updateTime: captureData.update_time,
      payer: captureData.payer,
      purchase_units: captureData.purchase_units,
    });

  } catch (error) {
    console.error('Capture order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}