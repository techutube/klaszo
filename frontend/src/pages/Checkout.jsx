import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
  const { subjectId } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // 'success' | 'failed' | ''
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    const res = await loadRazorpayScript();
    if (!res) {
      setError('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order
      const orderResponse = await axios.post(
        'http://localhost:8080/api/payments/create-order',
        { subjectId }, // For demo, we are passing the course ID as subjectId from the home page.
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, keyId } = orderResponse.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount.toString(),
        currency: currency,
        name: 'Klaszo Premium',
        description: 'Course Enrollment',
        order_id: orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            await axios.post(
              'http://localhost:8080/api/payments/verify',
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setStatus('success');
          } catch (err) {
            console.error('Verification failed', err);
            setStatus('failed');
            setError('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.name || 'Student',
          email: user?.email || 'student@klaszo.com',
        },
        theme: {
          color: '#4F46E5',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function () {
        setStatus('failed');
        setError('Payment cancelled or failed.');
      });

    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to initiate payment.');
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="checkout-container">
        <div className="checkout-card glass-panel success-card">
          <ShieldCheck size={64} className="success-icon" />
          <h2>Payment Successful!</h2>
          <p>Welcome to your new course. You can now access all the premium materials.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-card glass-panel">
        <h2 className="checkout-title">Complete Your Enrollment</h2>
        <p className="checkout-subtitle">You are about to purchase the course/subject ID: <br/><small>{subjectId}</small></p>
        
        <div className="checkout-details">
          <div className="detail-row">
            <span>Price:</span>
            <strong>₹499.00</strong>
          </div>
          <div className="detail-row">
            <span>Platform Fee:</span>
            <strong>Free</strong>
          </div>
          <div className="divider"></div>
          <div className="detail-row total-row">
            <span>Total:</span>
            <strong className="gradient-text">₹499.00</strong>
          </div>
        </div>

        {error && <div className="checkout-error">{error}</div>}

        <button 
          className="btn-primary checkout-btn" 
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? <Loader2 className="spinner" /> : <CreditCard size={20} />}
          {loading ? 'Processing...' : 'Pay with Razorpay'}
        </button>
        
        <div className="secure-badge">
          <ShieldCheck size={16} /> <span>100% Secure Encrypted Payment</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
