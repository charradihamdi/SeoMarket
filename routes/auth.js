const express = require("express");
const {
  signup,
  signin,
  verifyUser,
  updateUser,
  userInfo,
} = require("../controller/auth");
const {
  validateSignupRequest,
  isRequestValidated,
  validateSigninRequest,
} = require("../validators/auth");
const router = express.Router();

router.post("/signup", signup);
router.post("/signin", validateSigninRequest, isRequestValidated, signin);
router.put("/:id", updateUser);
router.get("/:id", userInfo);
router.post("/auth/verifyuser/:activationcode", verifyUser);
//router.post("/sendpasswordlink", sendPasswordLink);
//router.route("/setNewPassword/:id/:resetToken").post(setNewPassword);
module.exports = router;
