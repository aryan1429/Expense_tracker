// server/routes/expenses.js
const router = require('express').Router();
let Expense = require('../models/expense.model');

// GET all expenses
router.route('/').get(async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ createdAt: -1 }); // Sort by newest first
        res.json(expenses);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// POST a new expense
router.route('/add').post(async (req, res) => {
    const { description, amount, category } = req.body;

    // Input validation
    if (!description || typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({ error: 'Description is required and must be a non-empty string.' });
    }
    if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ error: 'Amount is required and must be a positive number.' });
    }
    if (!category || typeof category !== 'string' || category.trim() === '') {
        return res.status(400).json({ error: 'Category is required and must be a non-empty string.' });
    }

    const newExpense = new Expense({
        description: description.trim(),
        amount: Number(amount),
        category: category.trim(),
    });

    try {
        await newExpense.save();
        res.json({ message: 'Expense added!' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add expense.', details: err.message });
    }
});

// DELETE an expense
router.route('/:id').delete(async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json('Expense deleted.');
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

module.exports = router;