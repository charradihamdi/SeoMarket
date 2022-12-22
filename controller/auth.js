const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const { sendConfirmationEmail } = require("../routes/nodemailer");
const ObjectID = require("mongoose").Types.ObjectId;
const sendEmail = require("../routes/nodemailer");
const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.signup = (req, res) => {
  const characters = "0123456789azertyuiop^qsdfghjklmwxcvbn";

  let activationCode = "";
  for (let i = 0; i < 25; i++) {
    activationCode += characters[Math.floor(Math.random() * characters.length)];
  }
  const Numbers = "0123456789";
  let chiffre = "";
  for (let i = 0; i < 7; i++) {
    chiffre += Numbers[Math.floor(Math.random() * 7)];
  }

  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        error: "User already registered",
      });

    const { firstName, lastName, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      firstName,
      lastName,
      email,
      activationCode,
      hash_password,
      username: shortid.generate(),
      chiffre,
    });

    _user.save((error, user) => {
      if (error) {
        return res.status(400).json({
          message: "Something went wrong",
        });
      }

      if (user) {
        sendConfirmationEmail(_user.email, activationCode);
        const {
          _id,
          firstName,
          lastName,
          email,
          role,
          fullName,
          Statut,
          contactNumber,
          country,
          sexe,
          chiffre,
        } = user;
        return res.status(201).json({
          user: {
            _id,
            firstName,
            lastName,
            email,
            role,
            fullName,
            Statut,
            contactNumber,
            country,
            sexe,
            chiffre,
          },
        });
      }
    });
  });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error) return res.status(400).json({ error });
    if (user) {
      const isPassword = await user.authenticate(req.body.password);
      if (isPassword && user.role === "user" && !user.isActive) {
        res.status(300).json({
          message: "verify mail to activate account",
        });
      } else if (isPassword && user.role === "user") {
        const token = generateJwtToken(user._id, user.role);
        const {
          _id,
          firstName,
          lastName,
          email,
          role,
          fullName,
          statut,
          contactNumber,
          country,
          sexe,
          chiffre,
          isActive,
        } = user;
        res.status(200).json({
          token,
          user: {
            _id,
            firstName,
            lastName,
            email,
            role,
            fullName,
            statut,
            contactNumber,
            country,
            sexe,
            chiffre,
            isActive,
          },
        });
      } else {
        return res.status(400).json({
          message: "Something went wrong",
        });
      }
    } else {
      return res.status(400).json({ message: "Something went wrong" });
    }
  });
};

exports.verifyUser = (req, res) => {
  User.findOne({ activationCode: req.params.activationcode }).exec(
    (error, user) => {
      if (error) {
        res.status(400).send({
          message: "activation code false",
        });
      }
      if (user) {
        user.isActive = true;
        user.save();
        res.status(200).json({
          message: "account activation successful",
        });
      }
    }
  );
};
module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          sexe: req.body.data.sexe,
          country: req.body.data.country,
          contactNumber: req.body.data.contactNumber,
          statut: req.body.data.statut,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (err, docs) => {
        if (!err) return res.send(docs);
        if (err) return res.status(500).send({ message: err });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.userInfo = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  User.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("ID unknown : " + err);
  }).select("-password");
};

/********* */
module.exports.sendPasswordLink = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(422).send({ message: "please input your email !" });
  }

  if (email) {
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(409)
        .send({ message: "User with given email does not exist!" });
    }
    if (user) {
      const resetToken = user.getResetPasswordToken();
      console.log(resetToken);
      await user.save();
      const url = `http://localhost:3000/setNewPassword/${user._id}/${resetToken}`;
      await sendEmail(user.email, "reset password", url);
      console.log(url);
      res
        .status(200)
        .send({ message: "Password reset link sent to your email account" });
    } else if (!user) {
      res.status(400).send({ message: "email not exist" });
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      next();
    }
  }
};
