const UserModel = require("../models/users");
const { generateToken, isValidPassword, decodeToken } = require("../auth");

async function createUser(req, res) {
  const { firstname, lastname, email, password } = req.body;
  try {
    const foundUser = await UserModel.findOne({ email });
    if (foundUser) {
      return res.status(409).json({ error: "Email is already in use" });
    }
    const newUser = new UserModel({ firstname, lastname, email, password });
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(400).send("serverError");
  }
}

async function authenticateUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      if (await isValidPassword(password, user)) {
        const token = generateToken(user);
        const { _id } = user;
        return res.status(200).json({ token, _id });
      } else {
        return res.status(401).json({ error: "Password is invalid" });
      }
    } else {
      return res.status(401).json({ error: "Email is invalid" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("serverError");
  }
}

async function getUser(req, res) {
  const { id } = req.params;
  try {
    if (id !== decodeToken(req.headers.authorization.split(" ")[1])["sub"]) {
      return res.status(403).json({ error: "Access denied" });
    } else {
      const user = await UserModel.findById(id, { password: 0 });
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(400).json({ error: "User not found" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("serverError");
  }
}

async function updateUser(req, res) {
  const { id } = req.params;
  try {
    if (id !== decodeToken(req.headers.authorization.split(" ")[1])["sub"]) {
      return res.status(403).json({ error: "Access denied" });
    } else {
      const user = await UserModel.findById(id);
      if (user) {
        const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
          new: true,
        });
        return res.status(200).json(updatedUser);
      } else {
        return res.status(400).json({ error: "User not found" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("serverError");
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    if (id !== decodeToken(req.headers.authorization.split(" ")[1])["sub"]) {
      return res.status(403).json({ error: "Access denied" });
    } else {
      const user = await UserModel.findById(id);
      if (user) {
        await UserModel.findByIdAndDelete(id);
        return res.status(200).json("Deleted User");
      } else {
        return res.status(400).json({ error: "User not found" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("serverError");
  }
}

module.exports = {
  createUser,
  authenticateUser,
  getUser,
  updateUser,
  deleteUser,
};
