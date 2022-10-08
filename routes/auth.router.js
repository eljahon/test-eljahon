const Router = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const router = new Router();
const config = require("config");
const jwt = require("jsonwebtoken");
router.post(
  "/registration",
  [
    check("email", "Uncorrect email").isEmail(),
    check(
      "password",
      "Password must be longer than 3 and shorter than 12"
    ).isLength({ min: 3, max: 12 }),
  ],
  async (req, res) => {
    console.log(req.body, "=>> res.body");
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ massage: "Uncorrect request", errors });
      }
      const { password, email } = req.body;
      const candidate = await User.findOne({ email });
      if (candidate) {
        return res
          .status(400)
          .json({ message: `User with emai ${email} already exist` });
      }
      const hashPassword = await bcrypt.hash(password, 8);
      const user = new User({ email, password: hashPassword });
      await user.save();
      return res.json({ message: "User was create" });
    } catch (err) {
      res.send({ message: "Server error" });
    }
  }
);
router.post("/login", async (req, res) => {
  try {
    console.log(req.body, "REQUEST BODY!")

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ massage: "User not found" });
    }
    const isPassword = bcrypt.compareSync(password, user.password);
    if (!isPassword) {
      return res.status(400).json({ massage: "Invalid password" });
    }
    const token = jwt.sign({ id: user.id }, config.get("secriteKey"), {
      expiresIn: "5h",
    });
    return res.json({
      token,
      id: user.id,
      email: user.email,
      diskSpace: user.diskSpace,
      usedSpace: user.usedSpace,
      avatar: user.avatar,
    });
  } catch (err) {
    res.send({ message: "Server error" });
  }
});
module.exports = router;
