const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: `${process.env.EMAIL}`,
    pass: `${process.env.PASS_EMAIL}`,
  },
});

module.exports.sendConfirmationEmail = (email, activationCode) => {
  console.log(`http:localhost:3000/confirm/${activationCode}`);
  transport
    .sendMail({
      from: `${process.env.EMAIL}`,
      to: email,
      subject: "confirmation account",
      html: `<h1>Confirmation mail</h1>
            <h2>HI SIR</h2>
            <p>to activate your account</p>
            <a href=http:localhost:5000/api/${activationCode}>click here</a>
            `,
    })
    .catch((err) => console.log(err));
};
