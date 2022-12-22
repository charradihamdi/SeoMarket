const express = require("express");
const {
  signup,
  signin,
  deleteUser,
  getusers,
  signout,
} = require("../../controller/admin/auth");
const {
  validateSignupRequest,
  isRequestValidated,
  validateSigninRequest,
} = require("../../validators/auth");
const { requireSignin } = require("../../common-middleware");
const router = express.Router();

router.post("/admin/signup", signup);
router.post("/admin/signout", signout);
router.post("/admin/signin", validateSigninRequest, isRequestValidated, signin);
router.delete("/admin/:id", deleteUser);
router.get("/admin/users", getusers);
module.exports = router;
