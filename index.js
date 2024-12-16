

if(process.env.NODE_ENV !=="production"){
    require("dotenv").config();
}



const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const ejsMate = require("ejs-mate");
// const Joi = require("joi");
const methodOverride = require("method-override");
const session = require("express-session");
const flash =  require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet  = require("helmet");
const cors = require('cors');
const fs = require('fs');
const { Parser } = require('json2csv');
const MongoStore = require("connect-mongo");

const User = require("./models/user");
const userRoute = require("./routes/user");

app.use(mongoSanitize({
  replaceWith: '_'
}));

const Info = require("./models/info");

app.use(cors())
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,"public")));


const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});


app.engine("ejs",ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));

app.listen(5500,()=>{
    console.log("started listening to the port 5500");
})


const dbUrl = 'mongodb://127.0.0.1:27017/miniProject7'
// const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl)
  .then(()=>{
    console.log("connected");
  })
  .catch((err)=>{
    console.log("there is an error in connecting");
    console.log(err);
  })



  const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'fuckthisshit'
    }
});

const sessionConfig = {
    store,
    name: "session",
    secret: "fuckthishit",
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge:  1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());



app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
})


app.use("/",userRoute);

app.post("/add",async (req,res)=>{

    try{
     
        const geoData = await geocoder.forwardGeocode({
          query: req.body.location,
          limit: 1
        }).send();

        const info = new Info({
            location : req.body.location,
            geometry : geoData.body.features[0].geometry
        });
        console.log(info);
        info.save();
    }
    catch(e){
      console.log("error occured");
      console.log(e);
    }
    
    res.redirect("/add");

})

//download csv objects

app.get('/download-json', async(req, res) => {

  
  const info = await Info.find({});
  var coordinatesString = "";

  for(let x of info){
    coordinatesString+=x.geometry.coordinates[0];
    coordinatesString+=",";
    coordinatesString+=x.geometry.coordinates[1];
    coordinatesString+=";";
  }
  coordinatesString = coordinatesString.substring(0, coordinatesString.length - 1);
  const profile = 'driving';

  const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${profile}/${coordinatesString}?annotations=distance,duration&access_token=${mapBoxToken}`;


  try{

    const response = await fetch(url);
    if(!response.ok){
      throw new Error('Network responsewas not ok');
    }

    const geoData = await response.json();
    // console.log(geoData);
    const distances = geoData.distances , durations = geoData.durations;


    const x = distances;
    console.log(x);

      const jsonObject = [
        { key1: "value1", key2: "value2" },
        { key1: "value3", key2: "value4" }
      ];

      const fields = ['key1', 'key2']; // Fields you want to include in the CSV
      const json2csvParser = new Parser({fields});
      const csv = json2csvParser.parse(jsonObject);

      const filePath = path.join(__dirname, 'data.csv');

      fs.writeFileSync(filePath, csv);

      res.download(filePath, 'data.csv', (err) => {
          if (err) {
              console.log(err);
          }
      });

    res.redirect("/home");

  }
  catch(e){
    // console.log("error",e);
    res.send("some error occured in app.use accessing distance matrix");
  }    
  
});



app.get("/home",async (req,res)=>{

    const info = await Info.find({});
    var coordinatesString = "";

    for(let x of info){
      coordinatesString+=x.geometry.coordinates[0];
      coordinatesString+=",";
      coordinatesString+=x.geometry.coordinates[1];
      coordinatesString+=";";
    }
    coordinatesString = coordinatesString.substring(0, coordinatesString.length - 1);
    const profile = 'driving';

    const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${profile}/${coordinatesString}?annotations=distance,duration&access_token=${mapBoxToken}`;


    
    
    try{

      const response = await fetch(url);
      if(!response.ok){
        throw new Error('Network responsewas not ok');
      }

      const geoData = await response.json();
      // console.log(geoData);
      const distances = geoData.distances , durations = geoData.durations;

      res.render("index.ejs",{info,distances,durations});

    }
    catch(e){
      res.send("some error occured in app.use accessing distance matrix");
    }    
    


})


app.get('/map', (req, res) => {
  const locations = [
    { lat: 37.7749, lng: -122.4194 }, // Example: San Francisco
    { lat: 34.0522, lng: -118.2437 }, // Example: Los Angeles
    { lat: 40.7128, lng: -74.0060 }   // Example: New York
  ];

  res.render('map.ejs', { locations });
});
