const express = require('express');
const app = express();


const port = 3000;

app.listen(port,()=>{
    console.log(`Abdul Rahman ${port}`);
    
})


app.get('/', (req,res)=>{
    res.send("hello i am root  ")

})
app.get('/:user/:id', (req,res)=>{
    let {user , id }= req.params
    let html = `<h1>welcome to your account ${user}</h1>`
    res.send(html)

})


app.get('/search',(req,res)=>{
  let {q} = req.query
  if(!q){
    res.send(`<h1> Noting search </h1>`)
  }
    res.send(`<h1>search Query for result :${q}</h1>` )
    
})
// app.get('/apple', (req,res)=>{
//     res.send("this is apple root ")

// })
// app.get('/banana', (req,res)=>{
//     res.send("this is banana  root ")

// })
// app.get('/orange', (req,res)=>{
//     res.send("this is orange root ")

// })
// app.get('/*splat', (req,res)=>{
//     res.send("this is a universal  root ")

// })

// app.post('/', (req,res)=>{
//     res.send("this is a post  root ")

// })

// app.use((req,res)=>{
    
    
//     console.log("this is a Getting response ");
//     res.send("<h1>this is a response </h1>")
    
// })