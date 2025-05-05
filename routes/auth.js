const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const USERS = [{ id: 1, username: 'therapist', password: bcrypt.hashSync('password', 10) }];

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, 'secretkey', { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
