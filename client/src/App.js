// client/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import ExpenseChart from './components/ExpenseChart';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthWrapper from './components/AuthWrapper';

// Define the base URL for your API.
// In development, it's localhost. In production, it will be your deployed Render URL.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = API_BASE_URL.endsWith('/api/expenses') 
  ? API_BASE_URL 
  : `${API_BASE_URL}/api/expenses`;

function ExpenseTracker() {
    const [expenses, setExpenses] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const { user, logout } = useAuth();

    const fetchExpenses = useCallback(async () => {
        try {
            console.log('Fetching expenses with token:', localStorage.getItem('token')?.substring(0, 10) + '...');
            console.log('Authorization header:', axios.defaults.headers.common['Authorization']);
            
            const response = await axios.get(API_URL);
            console.log('Expenses fetched successfully:', response.data.length);
            setExpenses(response.data);
        } catch (error) {
            console.error("Error fetching expenses:", error);
            console.log("Error response:", error.response?.data);
            
            if (error.response?.status === 401) {
                console.log("Unauthorized - logging out user");
                logout();
            }
        }
    }, [logout]); // Include logout as a dependency

    useEffect(() => {
        if (user) {
            fetchExpenses();
        }
    }, [user, fetchExpenses]); // Include fetchExpenses as a dependency

    const addExpense = async (e) => {
        e.preventDefault();
        if (!description || !amount || !category) {
            alert("Please fill out all fields.");
            return;
        }
        try {
            await axios.post(`${API_URL}/add`, { description, amount, category });
            fetchExpenses(); // Refresh the list after adding
            // Clear form fields
            setDescription('');
            setAmount('');
            setCategory('');
        } catch (error) {
            console.error("Error adding expense:", error);
            if (error.response?.status === 401) {
                logout();
            }
        }
    };

    const deleteExpense = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchExpenses(); // Refresh the list after deleting
        } catch (error) {
            console.error("Error deleting expense:", error);
            if (error.response?.status === 401) {
                logout();
            }
        }
    };

    return (
        <div className="App">
            <header>
                <div className="header-content">
                    <h1>Finance Tracker</h1>
                    <div className="user-info">
                        <span>Welcome, {user?.username}!</span>
                        <button onClick={logout} className="logout-btn">
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>
            <main>
                <div className="form-container">
                    <h2>Add New Expense</h2>
                    <form onSubmit={addExpense}>
                        <input
                            type="text"
                            placeholder="What did you spend on?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Amount ($)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Category (e.g., Food, Transport)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                        <button type="submit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px"}}>
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Expense
                        </button>
                    </form>
                </div>

                <div className="expenses-container">
                    <h2>Spending Overview</h2>
                    <ExpenseChart data={expenses} />
                </div>

                <div className="expenses-container">
                    <h2>Your Expenses</h2>
                    {expenses.length === 0 ? (
                        <div className="no-expenses-message">
                            <p>No expenses recorded yet</p>
                            <p>Add your first expense using the form to start tracking your finances!</p>
                        </div>
                    ) : (
                        <ul className="expense-list">
                            {expenses.map((expense) => (
                                <li key={expense._id} className="expense-item">
                                    <div className="expense-details">
                                        <span className="expense-desc">{expense.description}</span>
                                        <span className="expense-cat">{expense.category}</span>
                                    </div>
                                    <div className="expense-actions">
                                        <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                                        <button onClick={() => deleteExpense(expense._id)} className="delete-btn">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}

function MainApp() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return isAuthenticated ? <ExpenseTracker /> : <AuthWrapper />;
}

export default App;