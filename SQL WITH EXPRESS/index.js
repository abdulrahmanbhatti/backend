const { faker } = require('@faker-js/faker');
const  mysql      = require('mysql2');

const connection = mysql.createConnection({
  host     : 'localhost',
  user    : 'root',
  password : 'mysql@a#b$d%u&l135',
  database : 'delta_app'
});

randomUser=()=> {
  return [
     faker.string.uuid(),
    faker.internet.username(),
     faker.internet.email(),
     faker.internet.password(),
  ];
}

let q = "INSERT INTO user (id,username,email,password) VALUES ?";
let data =[];
for ( let i =1 ; i <=1000;i++){
 data.push(randomUser());
 
}
try{
connection.query(q,[data],(err,result)=>{
    if(err) throw err
    console.log(result);
    })
}catch{
    console.log(err);
    
}

    connection.end();



  


