const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mufeezmujassir80@gmail.com',       // 🔁 Replace with your email
    pass: 'skpo yjyb lrqf yglp'               // 🔁 App password (not real password)
  }
});

module.exports = transporter;
