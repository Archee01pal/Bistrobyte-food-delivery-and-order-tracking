// 1. Import Express
const express = require('express');

// 2. Create an instance of an Express application
const app = express();

// 3. Define a port number for the server to listen on
const PORT = 3000;

// 4. Create a basic API route that sends hardcoded data using res.json()
app.get('/api/users', (req, res) => {
  const hardcodedUsers = [
    { id: 1, name: 'Alice', role: 'Developer' },
    { id: 2, name: 'Bob', role: 'Designer' },
    { id: 3, name: 'Charlie', role: 'Manager' }
  ];
  
  // Send the data as a JSON response
  res.json(hardcodedUsers);
});

// 5. Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running successfully at http://localhost:${PORT}`);
});