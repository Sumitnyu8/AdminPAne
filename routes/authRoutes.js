const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User'); // Ensure this is the correct path to your User model
const router = express.Router();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service provider
  auth: {
    user: 'your-email@gmail.com', // Your email
    pass: 'your-email-password', // Your email password or app password
  },
});

// Route to render the forgot password page
router.get('/forgot-password', (req, res) => {
  res.render('forgotPassword');
});

// Route to handle forgot password logic
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');

    // Here you would typically save the token and its expiry time to the user model
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Send email with reset link
    const resetLink = `http://localhost:3000/reset-password/${token}`; // Adjust based on your actual domain

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`,
    };

    await transporter.sendMail(mailOptions);
    res.send('Password reset link sent to your email!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending password reset email');
  }
});

// Route to render reset password page
router.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

  if (!user) {
    return res.status(400).send('Invalid or expired token');
  }

  res.render('resetPassword', { token });
});

// Route to handle password reset
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

  if (!user) {
    return res.status(400).send('Invalid or expired token');
  }

  // Update the user's password
  user.password = req.body.password; // Ensure to hash this password before saving
  user.resetPasswordToken = undefined; // Clear the token
  user.resetPasswordExpires = undefined; // Clear the expiry
  await user.save();

  res.send('Your password has been reset successfully! You can now log in.');
});

module.exports = router;
