import getPayPalAccessToken from '@/libs/paypal-access-token';
import { NextResponse } from 'next/server';

const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api.sandbox.paypal.com';

export async function POST(request) {
  try {
    const { amount, currency = 'USD' } = await request.json();
    
    const accessToken = await getPayPalAccessToken();

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount,
            },
            description: 'AidHandy Premium Service',
          },
        ],
        application_context: {
          brand_name: 'AidHandy',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          return_url: `${request.headers.get('origin')}/payment?success=true`,
          cancel_url: `${request.headers.get('origin')}/payment?canceled=true`,
        },
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('PayPal API Error:', orderData);
      return NextResponse.json(
        { error: orderData.message || 'Failed to create order' },
        { status: orderResponse.status }
      );
    }

    // Find approval URL
    const approvalLink = orderData.links.find(link => link.rel === 'approve');
    
    if (!approvalLink) {
      throw new Error('No approval URL found in PayPal response');
    }

    return NextResponse.json({
      orderId: orderData.id,
      status: orderData.status,
      approvalUrl: approvalLink.href,
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}