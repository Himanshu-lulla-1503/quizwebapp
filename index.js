const express = require('express');
const app = express();
const fetch = require("node-fetch");
const path = require('path');
const bcrypt = require('bcryptjs');
const signup=require('./database/conn.js');
const mongoose= require('mongoose');
const port= process.env.PORT || 8000;
app.set('view engine','hbs');
app.use(express.json());
app.use(express.urlencoded({extended:false}));
const staticpath=path.resolve('./public');
app.use(express.static(staticpath));
app.get('/',(req,res)=>{
    res.render('login',{
        flag:false
    });
});
app.get('/signup',(req,res)=>{
    res.render('signup');

});
app.post('/signup',(req,res)=>{
    let {name,email,phoneno,password,repassword}=req.body;

    const hash = async ()=>{
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
        return document
        }catch(err){
            console.log(err);
        }
    }
    
    
    const savedata= async()=>{
        try{
        const document=await hash();
        const data= await document.save();
        res.redirect('/');

        }catch(err){
            console.log(err);
        }

    }
    savedata();
    
});
app.post('/',(req,res)=>{
    let {username,password} = req.body;
    const verify = async()=>{
        try{
        const data= await signup.findOne({Email:username});
        if(data==null){
            res.status(401);
            res.render('login',{
                flag:true
            });
        }
        else{
            const pass = data.Password;
            const verifypass = async()=>{
                const status = await bcrypt.compare(password,pass);
                if(status===true){
                    res.redirect('quizhomepage');
                }
                else{
                    res.status(401);
                    res.render('login',{
                        flag:true
                    });
                }
            }
            verifypass(); 
        }
    }catch(err){
        console.log(err);
    }
}
verify();
});
app.get('/quizhomepage',(req,res)=>{
    res.render('quizhomepage');
});
app.get('/quiz',(req,res)=>{
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
app.get('*',(req,res)=>{
    res.render('error');
});
app.listen(port,()=>{
    console.log(`Server running at port ${port}`);
});

