
// Task 1: Express.js Setup
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());

// Task 1: "Hello World" route at the root endpoint
app.get('/', (req, res) => {
  res.send('Hello, World, Don  Here');
  
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



// Task 2: Product API// productApi.js - Basic CRUD operations for products
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];
const { v4: uuidv4 } = require('uuid');

// GET all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not Found' });
  res.json(product);
});

// POST create product
app.post('/api/products', (req, res) => {
  const product = { id: uuidv4(), ...req.body };
  products.push(product);
  res.status(201).json(product);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not Found' });
  products[index] = { id: req.params.id, ...req.body };
  res.json(products[index]);
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not Found' });
  products.splice(index, 1);
  res.status(204).send();
});



// Task 3: User Authentication

// Logger middleware
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
};
app.use(logger);
// Authentication middleware
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'SECRET_KEY') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
// Validation middleware
const validateProduct = (req, res, next) => {
  const { name, price } = req.body;
  if (!name || typeof price !== 'number') {
    return res.status(400).json({ error: 'Invalid product data' });
  }
  next();
};
// Apply middleware to routes
app.post('/api/products', apiKeyAuth, validateProduct);
app.put('/api/products/:id', apiKeyAuth, validateProduct);



// Task 4: Error Handling
// Custom error classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});
// Updated route with error handling
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) throw new NotFoundError('Product not found');
  res.json(product);
}));



// Task 5: Testing
// Filtering and pagination
app.get('/api/products', (req, res) => {
  let result = [...products];
  const { category, page = 1, limit = 10 } = req.query;
  
  if (category) {
    result = result.filter(p => p.category === category);
  }
  
  const start = (page - 1) * limit;
  const end = page * limit;
  result = result.slice(start, end);
  
  res.json({
    data: result,
    page: +page,
    total: products.length
  });
});
// Search endpoint
app.get('/api/products/search', (req, res) => {
  const { q } = req.query;
  const results = products.filter(p => 
    p.name.toLowerCase().includes(q.toLowerCase())
  );
  res.json(results);
});
// Stats endpoint
app.get('/api/products/stats', (req, res) => {
  const stats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  res.json(stats);
});