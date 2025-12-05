javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
// In-memory database (simple for this lab)
let pizzas = [
  { id: 1, name: 'Margherita', price: 10, available: true },
  { id: 2, name: 'Pepperoni', price: 12, available: true },
  { id: 3, name: 'Hawaiian', price: 11, available: true }
];
let orders = [];
let orderIdCounter = 1;
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});
// Get menu
app.get('/api/pizzas', (req, res) => {
  res.json(pizzas.filter(p => p.available));
});
// Get specific pizza
app.get('/api/pizzas/:id', (req, res) => {
  const pizza = pizzas.find(p => p.id === parseInt(req.params.id));
  if (!pizza) {
    return res.status(404).json({ error: 'Pizza not found' });
  }
  res.json(pizza);
});
// Place order
app.post('/api/orders', (req, res) => {
  const { pizzaId, quantity, customerName } = req.body;
  
  if (!pizzaId || !quantity || !customerName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const pizza = pizzas.find(p => p.id === pizzaId && p.available);
  if (!pizza) {
    return res.status(404).json({ error: 'Pizza not available' });
  }
  const order = {
    id: orderIdCounter++,
    pizzaId,
    pizzaName: pizza.name,
    quantity,
    customerName,
    totalPrice: pizza.price * quantity,
    status: 'pending',
    createdAt: new Date()
  };
  orders.push(order);
  res.status(201).json(order);
});
// Get order status
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});
// Admin: Add new pizza
app.post('/api/admin/pizzas', (req, res) => {
  const { name, price } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const newPizza = {
    id: pizzas.length + 1,
    name,
    price,
    available: true
  };
  pizzas.push(newPizza);
  res.status(201).json(newPizza);
});
const PORT = process.env.PORT || 3000;
// Only start server if not in test mode
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Pizza Palace API running on port ${PORT}`);
  });
}
module.exports = app;
