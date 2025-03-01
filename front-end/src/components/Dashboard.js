import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import supabase from './supabase/supabaseClient';

function Dashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // State for dashboard data
  const [coffeeData, setCoffeeData] = useState({
    dailySales: 0,
    popularItems: [],
    inventory: [],
    employees: []
  });

  useEffect(() => {
    // Check if user is logged in with Supabase
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      setUser(session.user);
      const role = localStorage.getItem('userRole') || 'employee';
      setUserRole(role);
      
      // Load data
      fetchDashboardData();
    };
    
    checkUser();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch daily sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('amount')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .lt('created_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString());
      
      if (salesError) throw salesError;
      
      const dailySales = salesData.reduce((sum, item) => sum + item.amount, 0);
      
      // Fetch popular items
      const { data: popularItems, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, products(name), count')
        .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString())
        .order('count', { ascending: false })
        .limit(5);
      
      if (itemsError) throw itemsError;
      
      // Fetch inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .order('item', { ascending: true });
      
      if (inventoryError) throw inventoryError;
      
      // Fetch employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });
      
      if (employeesError) throw employeesError;
      
      setCoffeeData({
        dailySales,
        popularItems: popularItems.map(item => ({
          name: item.products.name,
          sold: item.count
        })),
        inventory,
        employees
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // If there's an error, load dummy data for demo purposes
      setCoffeeData({
        dailySales: 1250.75,
        popularItems: [
          { name: 'Cappuccino', sold: 42 },
          { name: 'Latte', sold: 38 },
          { name: 'Espresso', sold: 30 },
          { name: 'Mocha', sold: 25 },
          { name: 'Cold Brew', sold: 22 }
        ],
        inventory: [
          { item: 'Coffee Beans (Arabica)', quantity: 25, unit: 'kg' },
          { item: 'Coffee Beans (Robusta)', quantity: 15, unit: 'kg' },
          { item: 'Milk', quantity: 45, unit: 'L' },
          { item: 'Sugar', quantity: 30, unit: 'kg' },
          { item: 'Chocolate Syrup', quantity: 12, unit: 'bottles' }
        ],
        employees: [
          { id: 1, name: 'John Smith', role: 'Barista', shift: 'Morning' },
          { id: 2, name: 'Emma Johnson', role: 'Barista', shift: 'Evening' },
          { id: 3, name: 'Michael Brown', role: 'Cashier', shift: 'Morning' },
          { id: 4, name: 'Sophia Davis', role: 'Cashier', shift: 'Evening' },
          { id: 5, name: 'Daniel Wilson', role: 'Manager', shift: 'Full day' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // The rest of your code (renderTabContent function) remains mostly the same,
  // but we'll add loading states

  const renderTabContent = () => {
    if (loading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    switch(activeTab) {
      case 'overview':
        return (
          <div className="dashboard-card">
            <h2>Daily Overview</h2>
            <div className="dashboard-stats">
              <div className="stat-item">
                <div className="stat-value">${coffeeData.dailySales.toFixed(2)}</div>
                <div className="stat-label">Today's Sales</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{coffeeData.popularItems.reduce((total, item) => total + item.sold, 0)}</div>
                <div className="stat-label">Drinks Sold</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{coffeeData.employees.length}</div>
                <div className="stat-label">Staff Working</div>
              </div>
            </div>

            <h3>Most Popular Items</h3>
            <div className="popular-items">
              {coffeeData.popularItems.map((item, index) => (
                <div key={index} className="popular-item">
                  <div className="item-name">{item.name}</div>
                  <div className="item-sold">{item.sold} sold</div>
                  <div className="item-bar">
                    <div className="item-progress" style={{ width: `${(item.sold / coffeeData.popularItems[0].sold) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="dashboard-card">
            <h2>Inventory Management</h2>
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {coffeeData.inventory.map((item, index) => (
                  <tr key={index}>
                    <td>{item.item}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>
                      <span className={`status ${item.quantity > 20 ? 'good' : item.quantity > 10 ? 'warning' : 'low'}`}>
                        {item.quantity > 20 ? 'Good' : item.quantity > 10 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'employees':
        return (
          <div className="dashboard-card">
            <h2>Staff Management</h2>
            <table className="employees-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Shift</th>
                  {userRole === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {coffeeData.employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.role}</td>
                    <td>{employee.shift}</td>
                    {userRole === 'admin' && (
                      <td>
                        <button className="action-button small">Edit</button>
                        <button className="action-button small danger">Remove</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {userRole === 'admin' && (
              <button className="action-button" onClick={() => alert('This would open a form to add a new employee')}>Add Employee</button>
            )}
          </div>
        );
      // Settings tab remains mostly the same
      case 'settings':
        return (
          <div className="dashboard-card">
            <h2>Account Settings</h2>
            <form className="settings-form">
              <div className="form-group">
                <label>Email</label>
                <input type="text" value={user ? user.email : ''} disabled />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={userRole === 'admin' ? 'Administrator' : 'Employee'} disabled />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Confirm new password" />
              </div>
              <button type="button" className="action-button">Update Profile</button>
            </form>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="coffee-logo">
            <div className="coffee-cup">
              <div className="steam"></div>
              <div className="steam"></div>
              <div className="steam"></div>
            </div>
          </div>
          <h2>Kaffi</h2>
          <p className="user-role">{userRole === 'admin' ? 'Administrator' : 'Employee'}</p>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
              <i className="icon">📊</i> Dashboard
            </li>
            <li className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>
              <i className="icon">📦</i> Inventory
            </li>
            <li className={activeTab === 'employees' ? 'active' : ''} onClick={() => setActiveTab('employees')}>
              <i className="icon">👥</i> Employees
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <i className="icon">⚙️</i> Settings
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <i className="icon">🚪</i> Logout
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Kaffi Cafe</h1>
          <div className="user-info">
            <span>Welcome, {user ? user.email : ''}</span>
          </div>
        </header>
        
        <div className="dashboard-content">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;