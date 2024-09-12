

if(process.env.NODE_ENV !=="production"){
    require("dotenv").config();
}


const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const cors = require('cors');
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



app.post("/add",async (req,res)=>{

    // const {location} = req.body;
    // res.send(location);
    try{
      // const address = req.body.location;
      // var newAdd = "";

      // for(let x of address){
      //   if(x==' '){
      //     newAdd+="+";
      //   }
      //   else{
      //     newAdd+=x;
      //   }
      // }

      // const url = `https://api.opencagedata.com/geocode/v1/json?q=${newAdd}&key=84b1e67fc4534823a413c4223bcba30b`;
      
      // const geoData = await fetch(url);

      // console.log(geoData);


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
    
    // console.log(geoData.body.features[0].geometry);


    res.redirect("/add");

})

app.use(async (req,res)=>{

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

    // console.log(url);

    
    // console.log(info[0].geometry.coordinates);
    // const geoData = await geodirector.getDirections({
      //     profile: 'driving-traffic',
      //     waypoints:[
        //         {
          //             coordinates: info[0].geometry.coordinates
          //         },
          //         {
            //             coordinates: info[1].geometry.coordinates
            //         }
            //     ]
            // }).send();
    
    try{

      const response = await fetch(url);
      if(!response.ok){
        throw new Error('Network responsewas not ok');
      }

      const geoData = await response.json();
      console.log(geoData);
      const distances = geoData.distances , durations = geoData.durations;

      res.render("main.ejs",{info,distances,durations});

    }
    catch(e){
      // console.log("error",e);
      res.send("some error occured in app.use accessing distance matrix");
    }    
    


})
