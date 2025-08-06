// server/routes/expenses.js
const router = require('express').Router();
let Expense = require('../models/expense.model');
const auth = require('../middleware/auth');

// GET all expenses for the authenticated user
router.route('/').get(auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user._id }).sort({ createdAt: -1 }); // Sort by newest first
        res.json(expenses);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// POST a new expense for the authenticated user
router.route('/add').post(auth, async (req, res) => {
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
        userId: req.user._id
    });

    try {
        await newExpense.save();
        res.json({ message: 'Expense added!' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add expense.', details: err.message });
    }
});

// DELETE an expense for the authenticated user
router.route('/:id').delete(auth, async (req, res) => {
    try {
        const expense = await Expense.findOne({ 
            _id: req.params.id, 
            userId: req.user._id 
        });
        
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found or not authorized' });
        }
        
        await Expense.findByIdAndDelete(req.params.id);
        res.json('Expense deleted.');
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

module.exports = router;