const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const port = ;
const admin = "";
const URL ="";
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
  secret: 123456,
  resave: false,
  saveUninitialized: true,
}))
mongoose.connect(URL);
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const User = mongoose.model('Users', userSchema);
app.get('/', (req, res) => {
  res.render('login');
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/signup', (req, res) => {
  res.render('signup');
});
app.get('/home', (req, res) => {
  res.render('home');
});
app.post('/signup', async function(req, res){
  const { name, email, password } = req.body;
  req.session.email = email;
  if(!name || !email || !password) {
    return res.send("<script> alert('Please enter all fields'); window.location.href = '/login'; </script> ")
  }
  if(password.length < 8) {
    return res.send("<script> alert('Password must be atleast 8 characters long') </script>");
  }
  if(email === admin){
    try {
      const hashPass = await bcrypt.hash(password, 10);
      const newUser = new User({
        name, 
        email,
        password: hashPass,
      });
      await newUser.save();
      return res.render('admin');
    } catch (error) {
      console.log(error);
      return res.redirect('/signup');
    }
  }
  if(await User.findOne({email : email})){
    return res.send("<script> alert('Email already exists'); window.location.href = '/login'; </script>");
  }
  try {
    const hashPass = await bcrypt.hash(password, 10);
    const newUser = new User({
      name, 
      email,
      password: hashPass,
    });
    await newUser.save();
    return res.redirect('/home');
  } catch (error) {
    console.log(error);
    return res.redirect('/signup');
  }
})
app.post('/', async function(req, res){
  const { name, password, email } = req.body;
  req.session.name = name;
  if(!name || !password || !email) {
    return res.send(
      "<script> alert('Please enter all fields'); window.location.href = '/login'; </script> "
    );
  }
  const username = await User.findOne({name: name});
  if(!username) {
    return res.send("<script> alert('invalid username'); window.location.href = '/login'; </script>");
  }
  const userPass = await bcrypt.compare(password, username.password);
  if(!userPass) {
    return res.send(
      "<script> alert('invalid password'); window.location.href = '/login'; </script>"
    );
  }
  const userEmail = await User.findOne({email: email});
  if(!userEmail) {
    return res.send(
      "<script> alert('invalid email'); window.location.href = '/login'; </script>"
    );
  } 
  if(email === admin){
    return res.render('admin');
  }
  return res.redirect('/home');
});
app.post("/login", async function (req, res) {
  const { name, password } = req.body;
  req.session.name = name;
  if (!name || !password) {
    return res.send(
      "<script> alert('Please enter all fields'); window.location.href = '/login'; </script> "
    );
  }
  const username = await User.findOne({ name: name });

  if (!username) {
    return res.send(
      "<script> alert('invalid username'); window.location.href = '/login'; </script>"
    );
  }
  const userPass = await bcrypt.compare(password, username.password);
  if (!userPass) {
    return res.send(
      "<script> alert('invalid password'); window.location.href = '/login'; </script>"
    );
  }
  if(userEmail === admin){
    return res.render('admin');
  }
  return res.redirect("/home");
});
app.listen(port, () => {
  console.log(`App listening on ${port}`);
})
