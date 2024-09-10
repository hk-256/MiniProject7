

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
const mbxDirection = require("@mapbox/mapbox-sdk/services/directions");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const geodirector = mbxDirection({accessToken: mapBoxToken});


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
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();

    const info = new Info({
        location : req.body.location,
        geometry : geoData.body.features[0].geometry
    });
    console.log(info);
    // console.log(geoData.body.features[0].geometry);

    info.save();

    res.redirect("/add");

})

app.use(async (req,res)=>{

    const info = await Info.find({});

    console.log(info[0].geometry.coordinates);
    const geoData = await geodirector.getDirections({
        profile: 'driving-traffic',
        waypoints:[
            {
                coordinates: info[0].geometry.coordinates
            },
            {
                coordinates: info[1].geometry.coordinates
            }
        ]
    }).send();

    console.log(geoData);
    res.render("main.ejs",{info});

})
