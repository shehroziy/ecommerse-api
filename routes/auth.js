const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const User = mongoose.model("User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../keys")
const login = require("../middleware/login")


router.get("/protected", login, (req, res) =>{
    res.send("hi user")
})

router.post('/signup',(req, res)=>{
    const {name, email, password} = req.body;
    if (!email || !password || !name){
        res.status(422).json({error: "Iltimos barcha ma'lumotlarni kiriting"})
    }
    // res.json({msg: "Muvaffaqiyatli yuborildi"})

    User.findOne({ email: email })
    .then((savedUser) =>{
        if(savedUser){
            return res
            .status(422)
            .json({error: "Bu email oldin ro'yxatdan o'tgan"})
        }
        bcrypt.hash(password, 10)
        .then(hashedPass =>{
            const user = new User({
                email,
                name, 
                password: hashedPass,
            })
            user.save()
            .then((user) =>{
                res.json({msg: "Siz muvffaqiyatli ro'yxatdan o'tdingiz"})
            })
            .catch((err) =>{
                console.log(err);
            })
        })
    })
})

router.post("/signin", (req, res) =>{
    const { email, password } = req.body
    if(!email || !password){
        res.status(422).json({error: "Plase add email or password"})
    }
    User.findOne({email: email})
    .then(savedUser =>{
        if(!savedUser){
            return res.status(422).json({error: "Invalid email or password"})
        }
        bcrypt.compare(password, savedUser.password)
        .then(doMatch =>{
            if(doMatch){
                // res.json({msg: "succesfully signed in"})
                const token = jwt.sign({_id: savedUser._id}, JWT_SECRET)
                res.json({token: token})
            }else{
                return res.status(422).json({error: "Invalid password"})
            }
        })
        .catch(err =>{
            console.log(err);
        })
    })
})

module.exports = router