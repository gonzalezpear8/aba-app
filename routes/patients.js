const express = require('express');
const router = express.Router();
const data = require('../data/mockPatients.json');

router.get('/', (req, res) => {
  res.json(data);
});

router.get('/:id', (req, res) => {
  const patient = data.find(p => p.id == req.params.id);
  if (!patient) return res.status(404).json({ message: 'Not found' });
  res.json(patient);
});

module.exports = router;
