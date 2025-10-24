'use client';
import { useState } from 'react';

export default function TestSMSReal() {
  const [form, setForm] = useState({
    to: '', // Will be your verified number
    message: '🎉 Test SMS from our Twilio integration!'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: form.to,
          body: form.message
        }),
      });
      
      const resultData = await response.json();
      setResult(resultData);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>📱 Real SMS Test</h1>
      <p><strong>Twilio Number:</strong> +18559970634</p>
      <p style={{ color: 'orange', fontWeight: 'bold' }}>
        ⚠️ Trial Account: Can only send to verified numbers
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>Your Verified Phone Number:</label>
          <input
            type="tel"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
            placeholder="+14155551234"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
          <small>Must be verified in Twilio console</small>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Message:</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows="3"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending Real SMS...' : '📱 Send Real SMS'}
        </button>
      </form>

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          <h4>{result.success ? '✅ SMS Sent!' : '❌ Failed'}</h4>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          {result.success && (
            <p>📱 Check your phone for the real SMS message!</p>
          )}
          {!result.success && result.error?.includes('verified') && (
            <p>🔒 This phone number needs to be verified in Twilio console first.</p>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f8ff', borderRadius: '8px' }}>
        <h3>Next Steps:</h3>
        <ol>
          <li>Ask client to verify your phone number in Twilio</li>
          <li>Test with your verified number</li>
          <li>Once working, ask client to verify other important numbers</li>
          <li>For production, upgrade from Trial to full account</li>
        </ol>
      </div>
    </div>
  );
}