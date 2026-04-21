const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/login", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
  

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const UserModel = mongoose.model('User', UserSchema);
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const userId = name.slice(0, 3).toLowerCase() + "@" + randomNumber;

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      userId
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


// ✅ LOGIN ROUTE
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    // ✅ Correctly compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: "Incorrect password" });
    }

    return res.json({
      message: "Success",
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
