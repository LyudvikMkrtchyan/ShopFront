const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors()); // Enable CORS for all origins

// Create an HTTP server and bind socket.io to it
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow access from any origin
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/calculation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));


const calculateRoutes = require('./routes/calculation');




// Serve static files (optional)
app.use(express.static('public'));

// Basic route
app.get('/', (req, res) => {
  res.status(200).send('Order Quotation System Backend');
});
app.use('/calculation', calculateRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
