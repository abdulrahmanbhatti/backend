const express = require("express")
const app = express()
const port = 3000
const path=require("path")
app.listen(port,()=>{
    console.log(`listening ....${port}`);
    
})

app.set("view engine","ejs")

app.set("views", path.join(__dirname, "/views"))
app.get("/",(req,res)=>{
  res.render("Home")
    
})
app.get("/hello",(req,res)=>{
    res.send("this is hello page ")
})


app.get("/ig/:user",(req,res)=>{
const {user} = req.params;
const instaData= require("./data.json")

   const data = instaData[user];
   console.log(data);
   if(data){
    res.render("instagram",{data})
   }
   else{
     res.render("error")
   }
   
    
    
    
})






app.get("/rolldice",(req,res)=>{

    let diceValue = Math.floor(Math.random()*6)+1
    res.render("rolldice",{diceValue})
})
