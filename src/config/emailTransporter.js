const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "yahoo",
  auth: {
    user: "youssef_aast2007@yahoo.com",
    pass: "woxixeolxnmbbjqa",
  },
});

module.exports = transporter;
