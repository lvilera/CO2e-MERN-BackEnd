const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure nodemailer using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aryanarshad5413@gmail.com',
    pass: 'gvyqmapsqsrrtwjm',
  },
});

// POST route for contact form
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  // Validate all fields are present
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    await transporter.sendMail({
      from: 'aryanarshad5413@gmail.com',
      to: 'aryanarshad5413@gmail.com',
      replyTo: email, // user's email
      subject: `[Contact Form] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
    
    console.log('Contact form email sent successfully');
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form email error:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

module.exports = router; 




