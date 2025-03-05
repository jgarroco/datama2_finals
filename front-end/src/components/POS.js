import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './POS.css';
import { supabase } from '../supabaseClient';

const POS = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeCategory, setActiveCategory] = useState('coffee');
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    // Add these new states for card and mobile payment subtypes
    const [cardType, setCardType] = useState('credit');
    const [cardNetwork, setCardNetwork] = useState('visa');
    const [mobilePaymentType, setMobilePaymentType] = useState('gcash');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [amountReceived, setAmountReceived] = useState('');
    const [change, setChange] = useState(0);
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
  
  // Menu items organized by category
  const menuItems = {
    coffee: [
      { id: 'c1', name: 'Espresso', price: 90, image: '☕' },
      { id: 'c2', name: 'Cappuccino', price: 120, image: '☕' },
      { id: 'c3', name: 'Latte', price: 130, image: '☕' },
    ],
    nonCoffee: [
      { id: 'nc1', name: 'Hot Chocolate', price: 110, image: '🍫' },
      { id: 'nc2', name: 'Steamed Milk', price: 90, image: '🥛' },
    ],
    matcha: [
      { id: 'm1', name: 'Matcha Latte', price: 140, image: '🍵' },
      { id: 'm2', name: 'Iced Matcha', price: 150, image: '🍵' },
    ],
    cloud: [
      { id: 'cl1', name: 'Cloud Coffee', price: 160, image: '☁️' },
      { id: 'cl2', name: 'Vanilla Cloud', price: 170, image: '☁️' },
    ],
    frappe: [
      { id: 'f1', name: 'Coffee Frappe', price: 160, image: '🥤' },
      { id: 'f2', name: 'Mocha Frappe', price: 170, image: '🥤' },
    ],
    yogurt: [
      { id: 'y1', name: 'Strawberry Yogurt', price: 140, image: '🍓' },
      { id: 'y2', name: 'Blueberry Yogurt', price: 140, image: '🫐' },
    ],
    milkTea: [
      { id: 'mt1', name: 'Classic Milk Tea', price: 120, image: '🧋' },
      { id: 'mt2', name: 'Taro Milk Tea', price: 130, image: '🧋' },
    ],
    fruitTea: [
      { id: 'ft1', name: 'Lemon Tea', price: 110, image: '🍋' },
      { id: 'ft2', name: 'Peach Tea', price: 120, image: '🍑' },
    ],
    fruitSoda: [
      { id: 'fs1', name: 'Strawberry Soda', price: 130, image: '🥤' },
      { id: 'fs2', name: 'Blue Lemonade', price: 130, image: '🥤' },
    ],
    croffles: [
      { id: 'cr1', name: 'Plain Croffle', price: 95, image: '🥐' },
      { id: 'cr2', name: 'Chocolate Croffle', price: 110, image: '🥐' },
    ],
    cakes: [
      { id: 'ck1', name: 'Chocolate Cake', price: 150, image: '🍰' },
      { id: 'ck2', name: 'Cheesecake', price: 160, image: '🍰' },
    ],
    pastries: [
      { id: 'p1', name: 'Cinnamon Roll', price: 120, image: '🥮' },
      { id: 'p2', name: 'Danish', price: 110, image: '🥮' },
    ],
    croissant: [
      { id: 'cs1', name: 'Ham & Cheese', price: 140, image: '🥪' },
      { id: 'cs2', name: 'Tuna', price: 150, image: '🥪' },
    ],
    fries: [
      { id: 'fr1', name: 'Regular Fries', price: 90, image: '🍟' },
      { id: 'fr2', name: 'Cheese Fries', price: 120, image: '🍟' },
    ],
    pasta: [
      { id: 'pa1', name: 'Carbonara', price: 180, image: '🍝' },
      { id: 'pa2', name: 'Bolognese', price: 190, image: '🍝' },
    ],
    cookies: [
      { id: 'co1', name: 'Chocolate Chip', price: 80, image: '🍪' },
      { id: 'co2', name: 'Oatmeal', price: 80, image: '🍪' },
    ],
  };

  // Category labels for display
  const categories = [
    { id: 'coffee', name: 'Coffee Based Drinks', icon: '☕' },
    { id: 'nonCoffee', name: 'Non-Coffee Drinks', icon: '🥛' },
    { id: 'matcha', name: 'Matcha Series', icon: '🍵' },
    { id: 'cloud', name: 'Cloud Series', icon: '☁️' },
    { id: 'frappe', name: 'Frappe Drinks', icon: '🥤' },
    { id: 'yogurt', name: 'Yogurt Drinks', icon: '🧁' },
    { id: 'milkTea', name: 'Milk Tea', icon: '🧋' },
    { id: 'fruitTea', name: 'Fruit Tea', icon: '🍵' },
    { id: 'fruitSoda', name: 'Fruit Soda', icon: '🥤' },
    { id: 'croffles', name: 'Croffles', icon: '🥐' },
    { id: 'cakes', name: 'Cakes', icon: '🍰' },
    { id: 'pastries', name: 'Pastries', icon: '🥮' },
    { id: 'croissant', name: 'Croissant Sandwich', icon: '🥪' },
    { id: 'fries', name: 'Fries', icon: '🍟' },
    { id: 'pasta', name: 'Pasta', icon: '🍝' },
    { id: 'cookies', name: 'Cookies', icon: '🍪' },
  ];

  useEffect(() => {
    // Check if user is logged in with Supabase
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      setUser(session.user);
    };
    
    checkUser();
  }, [navigate]);

  useEffect(() => {
    // Calculate total whenever cart changes
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

  const addToCart = (item) => {
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1
        };
        return updatedCart;
      } else {
        // Item doesn't exist, add new item
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === itemId);
      
      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        if (updatedCart[existingItemIndex].quantity > 1) {
          // Reduce quantity if more than 1
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity - 1
          };
        } else {
          // Remove item if quantity is 1
          updatedCart.splice(existingItemIndex, 1);
        }
        return updatedCart;
      }
      return prevCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Please add items to cart before checkout');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < total)) {
      alert('Please enter a valid amount received');
      return;
    }

    setLoading(true);
    
    try {
      // Calculate change if paying with cash
      if (paymentMethod === 'cash') {
        setChange(parseFloat(amountReceived) - total);
      }

      // Get payment details based on method
      let paymentDetails = { method: paymentMethod };
      
      // Add specific details based on payment method
      if (paymentMethod === 'card') {
        paymentDetails.cardType = cardType;
        paymentDetails.cardNetwork = cardNetwork;
      } else if (paymentMethod === 'mobile') {
        paymentDetails.mobileType = mobilePaymentType;
      }

      // Record the sale in Supabase
      const { data, error } = await supabase
        .from('sales')
        .insert([
          { 
            amount: total,
            payment_method: paymentMethod,
            payment_details: JSON.stringify(paymentDetails),
            items: JSON.stringify(cart),
            created_by: user.id
          }
        ]);
      
      if (error) throw error;
      
      // Show success message
      setOrderComplete(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setShowPaymentModal(false);
        setOrderComplete(false);
        setCart([]);
        setAmountReceived('');
        setChange(0);
        // Reset payment method options
        setCardType('credit');
        setCardNetwork('visa');
        setMobilePaymentType('gcash');
      }, 3000);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
      navigate('/dashboard');
    };
  // Fix the return statement structure
  return (
    <div className="pos-container">
      <aside className="pos-sidebar">
        <div className="sidebar-header">
          <div className="dashboard-coffee-logo">
            <div className="dashboard-coffee-cup">
              <div className="dashboard-steam"></div>
              <div className="dashboard-steam"></div>
              <div className="dashboard-steam"></div>
            </div>
          </div>
          <h2>Kaffi</h2>
          <p className="user-role">POS System</p>
        </div>
        
        <nav className="sidebar-nav pos-categories">
          <ul className="category-list">
            {categories.map(category => (
              <li 
                key={category.id}
                className={activeCategory === category.id ? 'active' : ''}
                onClick={() => setActiveCategory(category.id)}
              >
                <i className="icon">{category.icon}</i> {category.name}
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleBackToDashboard} className="logout-button">
            <i className="icon">🔙</i> Back to Dashboard
          </button>
        </div>
      </aside>
      
      <main className="pos-main-content">
        <header className="pos-header">
          <h1>Menu</h1>
          <div className="user-info">
            <span>Cashier: {user ? user.email : ''}</span>
          </div>
        </header>
        
        <div className="pos-content">
          <div className="menu-section">
            <h2>{categories.find(cat => cat.id === activeCategory)?.name}</h2>
            <div className="menu-items">
              {menuItems[activeCategory]?.map(item => (
                <div key={item.id} className="menu-item" onClick={() => addToCart(item)}>
                  <div className="item-image">{item.image}</div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">₱{item.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="cart-section">
            <div className="cart-header">
              <h2>Current Order</h2>
              <button className="clear-cart" onClick={clearCart}>Clear</button>
            </div>
            
            <div className="cart-items">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-quantity">
                      <button onClick={() => removeFromCart(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => addToCart(item)}>+</button>
                    </div>
                    <div className="cart-item-price">₱{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="empty-cart">There are currently no orders</div>
              )}
            </div>
            
            <div className="cart-total">
              <span>Total:</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            
            <button 
              className="checkout-button" 
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </main>
  {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            {!orderComplete ? (
              <>
                <h2>Payment</h2>
                <div className="payment-details">
                  <div className="payment-total">
                    <span>Total Amount:</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                  
                  <div className="payment-method">
                    <h3>Select Payment Method</h3>
                    <div className="payment-options">
                      <button 
                        className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('cash')}
                      >
                        <i className="icon">💵</i> Cash
                      </button>
                      <button 
                        className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <i className="icon">💳</i> Card
                      </button>
                      <button 
                        className={`payment-option ${paymentMethod === 'mobile' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('mobile')}
                      >
                        <i className="icon">📱</i> Mobile Payment
                      </button>
                    </div>
                  </div>
                  
                  {paymentMethod === 'cash' && (
                    <div className="cash-payment">
                      <label htmlFor="amount-received">Amount Received:</label>
                      <input
                        type="number"
                        id="amount-received"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        min={total}
                        step="0.01"
                      />
                      {parseFloat(amountReceived) >= total && (
                        <div className="change-amount">
                          <span>Change:</span>
                          <span>₱{(parseFloat(amountReceived) - total).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Add Card Payment Options */}
                  {paymentMethod === 'card' && (
                    <div className="card-payment">
                      <div className="card-type-options">
                        <h4>Card Type</h4>
                        <div className="option-buttons">
                          <button 
                            className={`option-button ${cardType === 'credit' ? 'active' : ''}`}
                            onClick={() => setCardType('credit')}
                          >
                            Credit Card
                          </button>
                          <button 
                            className={`option-button ${cardType === 'debit' ? 'active' : ''}`}
                            onClick={() => setCardType('debit')}
                          >
                            Debit Card
                          </button>
                        </div>
                      </div>
                      
                      <div className="card-network-options">
                        <h4>Card Network</h4>
                        <div className="option-buttons">
                          <button 
                            className={`option-button ${cardNetwork === 'visa' ? 'active' : ''}`}
                            onClick={() => setCardNetwork('visa')}
                          >
                            <i className="icon">💳</i> Visa
                          </button>
                          <button 
                            className={`option-button ${cardNetwork === 'mastercard' ? 'active' : ''}`}
                            onClick={() => setCardNetwork('mastercard')}
                          >
                            <i className="icon">💳</i> Mastercard
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Add Mobile Payment Options */}
                  {paymentMethod === 'mobile' && (
                    <div className="mobile-payment">
                      <h4>Mobile Payment Provider</h4>
                      <div className="option-buttons">
                        <button 
                          className={`option-button ${mobilePaymentType === 'gcash' ? 'active' : ''}`}
                          onClick={() => setMobilePaymentType('gcash')}
                        >
                          <i className="icon">📱</i> GCash
                        </button>
                        <button 
                          className={`option-button ${mobilePaymentType === 'maya' ? 'active' : ''}`}
                          onClick={() => setMobilePaymentType('maya')}
                        >
                          <i className="icon">📱</i> Maya
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="payment-actions">
                  <button 
                    className="cancel-payment" 
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-payment" 
                    onClick={handlePaymentSubmit}
                    disabled={loading || (paymentMethod === 'cash' && parseFloat(amountReceived) < total)}
                  >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                  </button>
                </div>
              </>
            ) : (
              <div className="payment-success">
                <div className="success-icon">✅</div>
                <h2>Payment Successful!</h2>
                {paymentMethod === 'cash' && (
                  <div className="change-info">
                    <p>Change: ₱{change.toFixed(2)}</p>
                  </div>
                )}
                {paymentMethod === 'card' && (
                  <div className="payment-info">
                    <p>{cardType === 'credit' ? 'Credit Card' : 'Debit Card'} ({cardNetwork})</p>
                  </div>
                )}
                {paymentMethod === 'mobile' && (
                  <div className="payment-info">
                    <p>Mobile Payment: {mobilePaymentType.toUpperCase()}</p>
                  </div>
                )}
                <p>Thank you for your purchase!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;