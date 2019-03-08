const express = require('express');
const bodyParser=require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors=require('cors');
const knex=require('knex');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'shubhanshu',
      database : 'test'
    }
  });
    

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/signin',(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password)
    {
        return res.status(400).json('Enter correct value');
    }
    
    db.select('email','hash').from('login')
    .where('email' ,'=', email)
    .then(data => {
       const isValid= bcrypt.compareSync(password,data[0].hash);
       if (isValid){
           return db.select('*').from('users')
           .where('email','=',email)
           .then(user=>{
               res.json(user[0])
           })
           .catch(err => res.status(400).json('unable to get user'))
       }
       else {
           res.status(400).json('wrong credentials')
       }
    })
     .catch(err=> res.status(400).json('wrong detail'));
})

app.post('/register',(req,res)=>{
    const {name,email,password} = req.body ;

    if(!name || !email || !password)
    {
        return res.status(400).json('Enter correct value');
    }
    
    const hash = bcrypt.hashSync(password);
    db.transaction(trx =>{
        trx.insert({
            hash: hash,
            email:email
        })
        .into('login')
        .returning('email')
        .then(loginemail =>{
           return trx('users').returning('*').insert({
                email:loginemail[0],
                name:name
         
            }).then(user =>{
                res.json(user[0]);
            })

        })
        .then(trx.commit)
        .catch(trx.rollback)
    })

   .catch(err => res.status(404).json('unable to register'));
    
})
// app.get('/',(req,res)=>{
//     res.json(database.users);
// })

app.listen(process.env.PORT || 3000);







//database.users[database.users.length-1]