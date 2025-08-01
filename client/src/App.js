// client/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ExpenseChart from './components/ExpenseChart';

// Define the base URL for your API.
// In development, it's localhost. In production, it will be your deployed Render URL.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/expenses';

function App() {
    const [expenses, setExpenses] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await axios.get(API_URL);
            setExpenses(response.data);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

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
        }
    };

    const deleteExpense = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchExpenses(); // Refresh the list after deleting
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    return (
        <div className="App">
            <header>
                <h1>Expense Tracker</h1>
            </header>
            <main>
              
                <div className="form-container">
                    <h2>Add New Expense</h2>
                    <form onSubmit={addExpense}>
                        <input
                            type="text"
                            placeholder="Description"
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
                            placeholder="Category (e.g., Food)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                        <button type="submit">Add Expense</button>
                    </form>
                </div>

                <div className="expenses-container">
                    <h2>Spending Overview</h2>
                    <ExpenseChart data={expenses} />
                </div>

                <div className="expenses-container">
                    <h2>Your Expenses</h2>
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
                                        &#10005; {/* A simple 'X' icon */}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
}

export default App;