const express = require('express');
const ejs = require('ejs')
const request = require('request');
const v = require('body-parser')
const app = express();
app.set('view engine',ejs);
app.use('/photos',express.static('photos'))
app.use(v.urlencoded({ extended: true }));
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
var serviceAccount = require("./key.json");
var passwordHash = require('password-hash');
initializeApp({
   credential: cert(serviceAccount)
  });
  const db = getFirestore();


app.get('/', function (req, res)  {
    res.render( __dirname + "/views/" + "signup.ejs",{data1:""});

})
app.get('/login', function (req, res) {
    res.render( __dirname + "/views/" + "login.ejs",{data2:""});

})

app.get('/weather', (req, res) => {
  res.render(__dirname + "/views/" +'weather.ejs',{weather:" ",
                                                   temp:"",
                                                   city:"",
                                                   data1:"",
                                                   data2:"",
                                                   data3:"",
                                                   data4:""});
});

// app.get('/dashboard',(req,res)=>{
//      res.render(__dirname +"/views/weather.ejs",);
// })


app.post('/weather', (req, res) => {
  const wea = req.body.city;
  
  console.log(wea);
 


  const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q='+wea+'&units=metric&appid=7d6beac541b8a6cdcf9ec104be6ae400';


  
  request(apiUrl,(error, response, body) => {
    const value1 = JSON.parse(body);
     const value2 = value1.name;
    const value3 = value1.main.temp+"°C";
     const value4 = value1.weather[0].main;
    const value5 ='feels_like = '+value1.main.feels_like;
    const  value6 ='pressure = '+value1.main.pressure;
     const value7 ='humidity = '+value1.main.humidity;
     const value8 ='speed = '+value1.wind.speed;
      console.log(value3);
    console.log(value2);
    console.log(value4);
    
   
   
   res.render('weather.ejs',{weather:value4,temp:value3,city:value2,data1:value5,data2:value6,data3:value7,data4:value8})
  });
});










app.post('/signup', (req, res) => {
  const email = req.body.Email;
 const  name=req.body.Fullname;
  // Check if the email already exists in the database
  db.collection('yogitha')
      .where('Email', '==', email).where('Fullname', '==', name)
      .get()
      .then((docs) => {
          if (!docs.empty) {
            
              res.render('signup.ejs', { data1: 'Email/Username already exists' });
          } else {
            
              db.collection('yogitha')
                  .add({
                      Fullname: name,
                      Email: email,
                      Password:passwordHash.generate(req.body.password)
                  })
                  .then(() => {
                      res.redirect('/login');
                  })
                  .catch((error) => {
                      console.error('Error adding document: ', error);
                      res.render('signup.ejs', { data1: 'Signup failed' });
                      
                  });
          }
      })
      .catch(() => {
          
          res.render('signup.ejs', { data1: 'Signup failed' });
      });
});


    app.post('/login',  (req, res) => {
      
      
        db.collection('yogitha').where("Email","==",req.body.Email)
      
        .get().then((docs)=>{
          
            if(docs.size > 0){
              const user = docs.docs[0].data();
              const hashedPassword =user.Password;
            if(passwordHash.verify(req.body.password, hashedPassword)){
               res.redirect("/weather");
            }
            else{
                res.render("login.ejs",{data2:"Login Fail"});
            }
          }else{
            res.render("login.ejs",{data2:"Login Fail"});
          }
            
        });
    });








app.listen(3000, () => {
  console.log("server start");
});