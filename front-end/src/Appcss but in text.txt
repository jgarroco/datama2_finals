import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { supabase } from '../supabaseClient';

const Dashboard = ({ session }) => {
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

  const [realtimeSubscription, setRealtimeSubscription] = useState(null);

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

    // Initial data fetch
    fetchDashboardData();

    // Set up realtime subscriptions
    const employeesSubscription = supabase
      .channel('public:employees')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employees' }, 
        (payload) => {
          console.log('Employees change received:', payload);
          fetchDashboardData(); // Refresh data when changes occur
        }
      )
      .subscribe();

    const inventorySubscription = supabase
      .channel('public:inventory')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'inventory' }, 
        (payload) => {
          console.log('Inventory change received:', payload);
          fetchDashboardData(); // Refresh data when changes occur
        }
      )
      .subscribe();

    const salesSubscription = supabase
      .channel('public:sales')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales' }, 
        (payload) => {
          console.log('Sales change received:', payload);
          fetchDashboardData(); // Refresh data when changes occur
        }
      )
      .subscribe();

    setRealtimeSubscription({
      employees: employeesSubscription,
      inventory: inventorySubscription,
      sales: salesSubscription
    });

    // Cleanup function
    return () => {
      if (realtimeSubscription) {
        supabase.removeChannel(realtimeSubscription.employees);
        supabase.removeChannel(realtimeSubscription.inventory);
        supabase.removeChannel(realtimeSubscription.sales);
      }
    };
  }, [navigate]);
  // Add this function near other navigation functions
  const handleGoToPOS = () => {
    navigate('/pos');
  };
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch daily sales from the sales table
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('amount')
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay);
      
      if (salesError) throw salesError;
      
      const dailySales = salesData ? salesData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) : 0;
      
      // Since there's no order_items or products table in your schema,
      // we'll need to adapt this part. For now, we'll use sales data grouped by payment_method
      // as a placeholder for popular items
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: popularSales, error: popularError } = await supabase
        .from('sales')
        .select('payment_method, amount')
        .gte('created_at', oneWeekAgo.toISOString());
      
      if (popularError) throw popularError;
      
      // Group sales by payment method
      const paymentMethodSales = {};
      if (popularSales) {
        popularSales.forEach(sale => {
          const method = sale.payment_method || 'Unknown';
          if (!paymentMethodSales[method]) {
            paymentMethodSales[method] = { count: 0, total: 0 };
          }
          paymentMethodSales[method].count += 1;
          paymentMethodSales[method].total += parseFloat(sale.amount) || 0;
        });
      }
      
      // Convert to array and sort by count
      const popularItems = Object.entries(paymentMethodSales)
        .map(([name, data]) => ({ name, sold: data.count }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);
      
      // Fetch inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('id, item, quantity, unit')
        .order('item', { ascending: true });
      
      if (inventoryError) throw inventoryError;
      
      // Fetch employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, role, shift, auth_id')
        .order('name', { ascending: true });
      
      if (employeesError) throw employeesError;
      
      setCoffeeData({
        dailySales: dailySales || 0,
        popularItems: popularItems || [],
        inventory: inventory || [],
        employees: employees || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Only use dummy data if we're in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Loading fallback data for development');
        setCoffeeData({
          dailySales: 1250.75,
          popularItems: [
            { name: 'Credit Card', sold: 42 },
            { name: 'Cash', sold: 38 },
            { name: 'Mobile Payment', sold: 30 },
            { name: 'Gift Card', sold: 25 },
            { name: 'Other', sold: 22 }
          ],
          inventory: [
            { id: 1, item: 'Coffee Beans (Arabica)', quantity: 25, unit: 'kg' },
            { id: 2, item: 'Coffee Beans (Robusta)', quantity: 15, unit: 'kg' },
            { id: 3, item: 'Milk', quantity: 45, unit: 'L' },
            { id: 4, item: 'Sugar', quantity: 30, unit: 'kg' },
            { id: 5, item: 'Chocolate Syrup', quantity: 12, unit: 'bottles' }
          ],
          employees: [
            { id: 1, name: 'John Smith', role: 'Barista', shift: 'Morning' },
            { id: 2, name: 'Emma Johnson', role: 'Barista', shift: 'Evening' },
            { id: 3, name: 'Michael Brown', role: 'Cashier', shift: 'Morning' },
            { id: 4, name: 'Sophia Davis', role: 'Cashier', shift: 'Evening' },
            { id: 5, name: 'Daniel Wilson', role: 'Manager', shift: 'Full day' }
          ]
        });
      } else {
        // In production, set empty values instead of dummy data
        setCoffeeData({
          dailySales: 0,
          popularItems: [],
          inventory: [],
          employees: []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Handler functions for inventory management
  const handleAddInventoryItem = async () => {
    navigate('/inventory/add');
  };

  const handleEditInventoryItem = (itemId) => {
    navigate(`/inventory/edit/${itemId}`);
  };

  const handleRemoveInventoryItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this inventory item?')) {
      try {
        const { error } = await supabase
          .from('inventory')
          .delete()
          .eq('id', itemId);
          
        if (error) throw error;
        
        // Refresh data after successful deletion
        fetchDashboardData();
      } catch (error) {
        console.error('Error removing inventory item:', error);
        alert('Failed to remove inventory item. Please try again.');
      }
    }
  };

  // Handler functions for employee management
  const handleAddEmployee = async () => {
    navigate('/employees/add');
  };

  const handleEditEmployee = (employeeId) => {
    navigate(`/employees/edit/${employeeId}`);
  };

  const handleRemoveEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', employeeId);
          
        if (error) throw error;
        
        // Refresh data after successful deletion
        fetchDashboardData();
      } catch (error) {
        console.error('Error removing employee:', error);
        alert('Failed to remove employee. Please try again.');
      }
    }
  };

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
                <div className="stat-label">Transactions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{coffeeData.employees.length}</div>
                <div className="stat-label">Staff Working</div>
              </div>
            </div>

            <h3>Payment Methods</h3>
            <div className="popular-items">
              {coffeeData.popularItems.length > 0 ? (
                coffeeData.popularItems.map((item, index) => (
                  <div key={index} className="popular-item">
                    <div className="item-name">{item.name}</div>
                    <div className="item-sold">{item.sold} transactions</div>
                    <div className="item-bar">
                      <div className="item-progress" style={{ 
                        width: `${(item.sold / (coffeeData.popularItems[0]?.sold || 1)) * 100}%` 
                      }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No transaction data available for the past week.</p>
              )}
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="dashboard-card">
            <h2>Inventory Management</h2>
            {coffeeData.inventory.length > 0 ? (
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Status</th>
                    {userRole === 'admin' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {coffeeData.inventory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.item}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td>
                        <span className={`status ${item.quantity > 20 ? 'good' : item.quantity > 10 ? 'warning' : 'low'}`}>
                          {item.quantity > 20 ? 'Good' : item.quantity > 10 ? 'Medium' : 'Low'}
                        </span>
                      </td>
                      {userRole === 'admin' && (
                        <td>
                          <button className="action-button small" onClick={() => handleEditInventoryItem(item.id)}>Edit</button>
                          <button className="action-button small danger" onClick={() => handleRemoveInventoryItem(item.id)}>Remove</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No inventory items found. {userRole === 'admin' && 'Add some items to get started.'}</p>
            )}
            {userRole === 'admin' && (
              <button className="action-button" onClick={handleAddInventoryItem}>Add Item</button>
            )}
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
                        <button className="action-button small" onClick={() => handleEditEmployee(employee.id)}>Edit</button>
                        <button className="action-button small danger" onClick={() => handleRemoveEmployee(employee.id)}>Remove</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {userRole === 'admin' && (
              <button className="action-button" onClick={handleAddEmployee}>Add Employee</button>
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
      case 'profile':
        return (
          <div className="dashboard-card user-profile">
            <h2>User Profile</h2>
            <div className="profile-info">
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Last Sign In:</strong> {new Date(session.user.last_sign_in_at).toLocaleString()}</p>
            </div>
            <button 
              className="action-button danger" 
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </button>
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
          <div className="dashboard-coffee-logo">
            <div className="dashboard-coffee-cup">
              <div className="dashboard-steam"></div>
              <div className="dashboard-steam"></div>
              <div className="dashboard-steam"></div>
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
            <button className="pos-button" onClick={handleGoToPOS}>
              <i className="icon">💰</i> POS System
            </button>
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