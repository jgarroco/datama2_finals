import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample coffee shop data
  const [coffeeData, setCoffeeData] = useState({
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

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('userRole');
    
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      setUserRole(role);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const renderTabContent = () => {
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
            <button className="action-button">Order Supplies</button>
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
              <button className="action-button">Add Employee</button>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="dashboard-card">
            <h2>Account Settings</h2>
            <form className="settings-form">
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={userRole === 'admin' ? 'admin' : 'employee'} disabled />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={userRole === 'admin' ? 'Administrator' : 'Employee'} disabled />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value="user@coffeeshop.com" />
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
          <h2>Coffee Shop</h2>
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
          <h1>Coffee Shop Management</h1>
          <div className="user-info">
            <span>Welcome, {userRole === 'admin' ? 'Admin' : 'Employee'}</span>
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