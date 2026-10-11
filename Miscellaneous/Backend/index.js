const express = require("express")
const app = express()
const port = 3000;
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.listen(port,()=>{
console.log(`listen to port ${port}`);

})

app.get("/register",(req,res)=>{
    let {name , pass }= req.query;
    res.send(`this is Get response ${name}`)
})
app.post("/register",(req,res)=>{
   let { user , pass}=req.body;
    
    res.send(`this is post request ${user}`)
})