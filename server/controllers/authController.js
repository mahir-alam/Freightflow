const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const signupUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: "Full name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (existingUser.rowCount > 0) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, 'client')
      RETURNING
        id,
        full_name AS "fullName",
        email,
        role
      `,
      [fullName, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = createToken(user);

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    console.error("Error signing up:", error.message);
    res.status(500).json({ error: "Failed to create account" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        full_name AS "fullName",
        email,
        password_hash AS "passwordHash",
        role
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ error: "Failed to login" });
  }
};

module.exports = {
  signupUser,
  loginUser,
};