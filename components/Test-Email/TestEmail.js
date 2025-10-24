import { useState } from 'react';

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sendTestEmail = async () => {
    setLoading(true);
    setResult(null);
    try {
      // call the api to send test email
      const response = await fetch('/api/email/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          name: name
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>📧 Test Email Integration From Email Setup Twilio</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '8px', width: '150px' }}
        />
      </div>
      
      <button 
        onClick={sendTestEmail} 
        disabled={loading || !email || !name}
        style={{ padding: '10px 20px' }}
      >
        {loading ? 'Sending...' : 'Send Test Email'}
      </button>

      {result && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {result.success ? (
            <p>✅ Email sent successfully! Check your inbox.</p>
          ) : (
            <p>❌ Failed: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}