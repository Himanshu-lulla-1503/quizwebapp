const express = require('express');
const app = express();
const fetch = require("node-fetch");
const path = require('path');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const signup=require('./database/conn.js');
const mongoose= require('mongoose');
const session=require('express-session');
const MongoDbSession=require('connect-mongodb-session')(session);

const storesession= new MongoDbSession({
    uri:"mongodb+srv://Himanshu_Lulla:herobaby007@gmail.com@cluster0.fg2gf.mongodb.net/himanshu?retryWrites=true&w=majority",
    collection:'mysessions'
});
app.use(session({
    secret:process.env.SECRET_KEY,
    resave:false,
    saveUninitialized:false,
    store:storesession
}));
const port= process.env.PORT || 8000;
app.set('view engine','hbs');
app.use(express.json());
app.use(express.urlencoded({extended:false}));
const staticpath=path.resolve('./public');
app.use(express.static(staticpath));

const authentication=(req,res,next)=>{
    if(!req.session.isAuth){
        res.redirect('/');
    }
    else{
        next();
    }

}
app.get('/',(req,res)=>{
    res.render('login',{
        flag:false
    });
});
app.get('/signup',(req,res)=>{
    res.render('signup');

});
app.post('/signup',async(req,res)=>{
    let {name,email,phoneno,password,repassword}=req.body;
        try{
        password= await bcrypt.hash(password,10);
        repassword= await bcrypt.hash(repassword,10);
        var document = new signup({
            Username:name,
            Email:email,
            Phoneno:phoneno,
            Password:password,
            Repassword:repassword
    
        });
        await document.save();
        res.redirect('/');
        }catch(err){
            console.log(err);
            res.statusCode=401;
            res.json({'error':'User with email id already exists'});
        }    
});
app.post('/',async(req,res)=>{
    let {username,password} = req.body;
        try{
        const data= await signup.findOne({Email:username});
        if(!data){
            res.render('signup');
        }
        else{
            const pass = data.Password;
                const status = await bcrypt.compare(password,pass);
                if(!status){
                    res.status(401);
                    res.render('login',{
                        flag:true
                    });
                   
                }
                else{
                    req.session.isAuth=true;
                    res.redirect('quizhomepage');
                }
            }
        }
        catch(err){
            console.log(err);
        }
});

            
app.get('/quizhomepage',authentication,(req,res)=>{
    res.render('quizhomepage');
});
app.get('/quiz',authentication,(req,res)=>{
    const category = req.query.category;
    const fetchdata = async (category)=>{
        try{
        const data = await fetch(`https://quizapi.io/api/v1/questions?apiKey=dVExB1tQVBUtzyBG3fphSImbItC6e8aBuPWr7lkO&category=${category}&limit=1`);
        const actual = await data.json();
        const ans =Object.values(actual[0].correct_answers);
        const answers=["answer_a","answer_b","answer_c","answer_d","answer_e","answer_f"];
        res.render('quizpage1',{
            quizdata:actual[0],
            category:category,
            correctans:answers[ans.indexOf("true")]
        });
        }catch(err){
            console.log(err);
        }
        
    }
    fetchdata(category);
});
app.get('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('/');
    });
});

app.get('*',(req,res)=>{
    res.render('error');
});
app.listen(port,()=>{
    console.log(`Server running at port ${port}`);
});

