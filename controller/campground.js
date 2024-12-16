// console.log("campground.js");

const campground = require("../models/campground");
const Solution = require("../models/front");

// const campgroundSchema = require("../validationSchema");
// const reviewSchema = require("../reviewSchema");

const path = require("path");
const { exec } = require('child_process');

const Review = require("../models/review");
const {cloudinary} = require("../cloudinary");

const mbxClient = require('@mapbox/mapbox-sdk'); // Import Mapbox SDK
const matrixService = require('@mapbox/mapbox-sdk/services/matrix');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

const mapbox = mbxClient({ accessToken: mapBoxToken });
const matrixClient = matrixService(mapbox);

const mongoose = require('mongoose');
const room = require("../models/room");
// const solution = require("../models/solution");
const Fronts = require("../models/front")

const dateSchema = new mongoose.Schema({
    dates: [Date]
});
const DateModel = mongoose.model('DateModel', dateSchema);


const timeToNum = (time)=>{
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}


const evaluate = async()=>{

    const example = [
        {
            "frontNumber": 1,
            "solutions": [
                {
                    "numberOfVehicles": 2,
                    "Routes": [
                        {
                            "Route": [
                                { "customerID": 101 },
                                { "customerID": 102 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 201 }
                            ]
                        }
                    ],
                    "totalDistance": 300.0
                },
                {
                    "numberOfVehicles": 3,
                    "Routes": [
                        {
                            "Route": [
                                { "customerID": 301 },
                                { "customerID": 302 },
                                { "customerID": 303 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 401 },
                                { "customerID": 402 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 501 }
                            ]
                        }
                    ],
                    "totalDistance": 550.5
                },
                {
                    "numberOfVehicles": 1,
                    "Routes": [
                        {
                            "Route": [
                                { "customerID": 601 },
                                { "customerID": 602 },
                                { "customerID": 603 },
                                { "customerID": 604 }
                            ]
                        }
                    ],
                    "totalDistance": 250.0
                }
            ]
        },
        {
            "frontNumber": 2,
            "solutions": [
                {
                    "numberOfVehicles": 4,
                    "Routes": [
                        {
                            "Route": [
                                { "customerID": 701 },
                                { "customerID": 702 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 801 },
                                { "customerID": 802 },
                                { "customerID": 803 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 901 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 1001 },
                                { "customerID": 1002 },
                                { "customerID": 1003 }
                            ]
                        }
                    ],
                    "totalDistance": 450.0
                },
                {
                    "numberOfVehicles": 2,
                    "Routes": [
                        {
                            "Route": [
                                { "customerID": 1101 },
                                { "customerID": 1102 },
                                { "customerID": 1103 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 1201 },
                                { "customerID": 1202 }
                            ]
                        }
                    ],
                    "totalDistance": 320.0
                },
                {
                    "numberOfVehicles": 6,
                    "Routes": [
                        {
                            "Route": [
                                { "customerID": 1301 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 1401 },
                                { "customerID": 1402 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 1501 },
                                { "customerID": 1502 },
                                { "customerID": 1503 },
                                { "customerID": 1504 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 1601 },
                                { "customerID": 1602 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 1701 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 1801 },
                                { "customerID": 1802 }
                            ]
                        }
                    ],
                    "totalDistance": 700.0
                }
            ]
        },
        {
            "frontNumber": 3,
            "solutions": [
                {
                    "numberOfVehicles": 3,
                    "Routes": [
                        {
                            "Route": [
                                { "customerID": 201 },
                                { "customerID": 202 },
                                { "customerID": 203 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 301 },
                                { "customerID": 302 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 401 },
                                { "customerID": 402 },
                                { "customerID": 403 },
                                { "customerID": 404 }
                            ]
                        }
                    ],
                    "totalDistance": 560.0
                },
                {
                    "numberOfVehicles": 5,
                    "Routes": [
                        {
                            "Route": [
                                { "customerID": 501 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 601 },
                                { "customerID": 602 },
                                { "customerID": 603 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 701 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 801 },
                                { "customerID": 802 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 901 },
                                { "customerID": 902 },
                                { "customerID": 903 },
                                { "customerID": 904 }
                            ]
                        }
                    ],
                    "totalDistance": 620.0
                },
                {
                    "numberOfVehicles": 2,
                    "Routes": [
                        {
                            "Route": [
                                { "customerID": 1001 },
                                { "customerID": 1002 },
                                { "customerID": 1003 }
                            ]
                        },
                        {
                            "Route": [
                                { "customerID": 1101 },
                                { "customerID": 1102 }
                            ]
                        }
                    ],
                    "totalDistance": 400.0
                }
            ]
        }
    ]
    

    await Fronts.deleteMany();

    
    for(let front of example){
        const Front = new Fronts(front);
        await Front.save();
        // console.log(Front);
        // break;
    }

    const result = [];
    return result;

}

module.exports.index = async (req,res)=>{
    const campsX = await campground.find({});
    const depot = await campground.findById('674a3527869be478d4cca794');
    // console.log(camps);
    const camps = campsX.filter( items => items._id != '674a3527869be478d4cca794' );

    const coordinates = [];
    camps.forEach(camp => {
        coordinates.push({coordinates : camp.geometry.coordinates});
    });
    // console.log(coordinates);
    try{

        const response = await matrixClient.getMatrix({
            points : coordinates,
            profile: 'driving',
            annotations: ['distance', 'duration']
            })
            .send();

        
        const matrix = response.body;

        const durations = matrix.durations , distances = matrix.distances;
        console.log(depot);
        res.render("campground/index",{camps , distances , durations , depot});
        
    }
    catch(e){
        console.log("error occured while fetching distance and duration matrix");
        res.send("error occured while fetching distance and duration matrix");
    };


        // .then(response => {
        //     const matrix = response.body;
        //     durations = matrix.durations; 
        //     distances = matrix.distances;
        //     // console.log(durations);
        //     res.render("campground/index",{camps , distances , durations});
        // })
        // .catch(err =>{
        //     console.log("error occured while fetching distance and duration matrix");
        //     res.send("error occured while fetching distance and duration matrix");
        // })
    // res.render("campground/index",{camps});
   
}

// module.exports.getHome = async(req, res)=>{
//     res.render("campground/home");
// }

module.exports.search = async(req,res)=>{
    const {id} = req.params;
    const camps = await campground.find({
        'title': {
            '$regex': id,
            '$options': 'i'
        }
    }).limit(20);
    
    res.render("campground/index",{camps});
}

module.exports.renderNewFrom = (req,res)=>{
    res.render("campground/new");
}

module.exports.createCampground = async (req,res)=>{   
    // console.log(req.body);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const camp = new campground(req.body.campground);
    camp.geometry = geoData.body.features[0].geometry;
    // const images = req.files.map(f=>({
    //     url: f.path,
    //     filename: f.filename
    // }));
    // camp.image = images;
    camp.author = req.user._id;;

    // camp.startTime = timeToNum(req.body.campground.startTime);
    // camp.endTime = timeToNum(req.body.campground.endTime);
    // camp.serviceTime = timeToNum(req.body.campground.serviceTime);

    // res.send(camp);
    await camp.save();
    req.flash("success","Added a location successfully");
    res.redirect(`/locations`);

}

module.exports.depot = async (req,res)=>{

    const camp = await campground.findById('674a3527869be478d4cca794');

    if(!camp){
        req.flash("error","campground not found");
        return res.redirect("/locations");
    }

    res.render("campground/depot",{camp});

}


async function parseCppOutput(output) {
    const lines = output.split("\n").filter(line => line.trim() !== "");
    const numberOfFronts = parseInt(lines[0], 10);
    let lineIndex = 1;

    const fronts = [];

    for (let frontNumber = 1; frontNumber <= numberOfFronts; frontNumber++) {
        const numberOfSolutions = parseInt(lines[lineIndex++], 10);

        const solutions = [];
        for (let solutionIndex = 0; solutionIndex < numberOfSolutions; solutionIndex++) {
            const [totalDistance, numberOfVehicles] = lines[lineIndex++].split(" ").map(Number);

            const numberOfRoutes = parseInt(lines[lineIndex++], 10);
            const routes = [];

            for (let routeIndex = 0; routeIndex < numberOfRoutes; routeIndex++) {
                const numberOfCustomers = parseInt(lines[lineIndex++], 10);
                const customers = lines[lineIndex++].split(" ").map(Number);

                routes.push({ Route: customers.map(customerID => ({ customerID })) });
            }

            solutions.push({
                totalDistance,
                numberOfVehicles,
                Routes: routes,
            });
        }

        fronts.push({
            frontNumber,
            solutions,
        });
    }

    return fronts;
}

function executeCppProgram(cppProgramPath) {
    return new Promise((resolve, reject) => {
        exec(cppProgramPath, (error, stdout, stderr) => {
            if (error) {
                return reject(new Error(`Error executing C++ program: ${error.message}`));
            }
            if (stderr) {
                return reject(new Error(`C++ program error: ${stderr}`));
            }
            resolve(stdout);
        });
    });
}

module.exports.fronts = async (req,res)=>{
    const {id} = req.params;
    const front = await Fronts.findOne({frontNumber : id});
    
    // console.log(front.solutions[0].Routes);

    res.render("campground/fronts" , {front});
}

module.exports.evaluate = async (req,res)=>{




    const cppProgramPath = path.join(__dirname, '../main.exe'); // Adjust the path
    try {
        // Execute the C++ program and await its output
        const stdout = await executeCppProgram(cppProgramPath);

        // Parse the output and await the parsing
        // console.log(stdout);


        const data = await parseCppOutput(stdout);

        // await Fronts.deleteMany({});
        for(let X of data){
            const front = new Fronts(X);
            // await front.save();
        }

        const fronts = await Fronts.find({});
        res.render("campground/evaluate" , {fronts});
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).send("An error occurred.");
    }
    // exec(cppProgramPath, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`Error executing C++ program: ${error.message}`);
    //         req.flash("error","Error executing C++ program");
    //         return res.status(500).send('Error executing C++ program.');
    //     }
    //     if (stderr) {
    //         console.error(`stderr: ${stderr}`);
    //         req.flash("error","Error executing C++ program");
    //         return res.status(500).send('C++ program error.');
    //     }
    //     // Send the C++ program output to the browser
    //     req.flash("success","Program Executed successfully");
        
    //     // console.log(stdout);
    //     const data = await parseCppOutput(stdout);
    //     console.log(data[0].solutions[0].Routes[0]);

    //     // res.render('home', { output: stdout.trim() });
    // });
    // console.log(id);

    //////////////////////////////////////////



    // const camps = await campground.find({});

    // const coordinates = [];
    // camps.forEach(camp => {
    //     coordinates.push({coordinates : camp.geometry.coordinates});
    // });


    // try{

    //     const response = await matrixClient.getMatrix({
    //         points : coordinates,
    //         profile: 'driving',
    //         annotations: ['distance', 'duration']
    //         })
    //         .send();

        
    //     const matrix = response.body;

    //     const durations = matrix.durations , distances = matrix.distances;

    //     const results = await evaluate(distances , durations , camps);
    //     // console.log(results);

    //     const fronts = await Fronts.find({});
    //     // console.log(fronts);
    //     res.render("campground/evaluate" , {fronts});
        
    // }
    // catch(e){
    //     console.log("error occured while fetching distance and duration matrix");
    //     res.send("error occured while fetching distance and duration matrix");
    // };

    // const response = await matrixClient.getMatrix({
    //     points : coordinates,
    //     profile: 'driving',
    //     annotations: ['distance', 'duration']
    //     })
    //     .send();
        // .then(response => {
        //     const matrix = response.body;
        //     durations = matrix.durations; 
        //     distances = matrix.distances;
        //     // const results = await evaluate(durations , distances , camps);
        //     // console.log(results);

        //     res.send("here"); 
        //     //first save into solutions and then redirect

        //     // res.redirect("/locations/showSolutions");
        // })
        // .catch(err =>{
        //     console.log("error occured while fetching distance and duration matrix");
        //     res.send("error occured while fetching distance and duration matrix");
        // })

        // console.log(response.body);

      
}

module.exports.showCampground = async (req,res)=>{
    const {id} = req.params;
    const camp = await campground.findById(id).populate({
        path: "reviews",
        populate:{
            path:"author"
        }
    }).populate("author","username");
    if(!camp){
        req.flash("error","campground not found");
        return res.redirect("/campground");
    }
    // console.log(camp);
    res.render("campground/show",{camp});
}


module.exports.renderEditFrom = async (req,res)=>{
    const {id} = req.params;
    // console.log(id);
    const camp = await campground.findById(id);
    if(!camp){
        req.flash("error","campground not found");
        return res.redirect("/campground");
    }
    res.render("campground/edit",{camp});
}

module.exports.updateCampground = async (req,res,next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    // console.log(req.body);
    const {id} = req.params;
    const camp = await campground.findByIdAndUpdate(id,{...req.body.campground});
    camp.geometry = geoData.body.features[0].geometry;
    // const images = req.files.map(f=>({
    //     url: f.path,
    //     filename: f.filename
    // }));
    // camp.image.push(...images);
    await camp.save();
    // if(req.body.deleteImages){
    //     for(let filename of req.body.deleteImages){
    //         await cloudinary.uploader.destroy(filename);
    //     }
    //     await camp.updateOne({$pull: {image: {filename: {$in: req.body.deleteImages}}}})
    // }
    req.flash("success","successfully updated the location");
    res.redirect(`/locations`);


}

module.exports.deleteCampground = async (req,res)=>{
    const {id} = req.params;
    if(id=='674a3527869be478d4cca794'){
        req.flash("error","Can not delete the depot");
        res.redirect("/locations");
    }
    // console.log(id);
    const camp = await campground.findByIdAndDelete(id);
    
    // const Y = await Review.deleteMany({
    //     _id:{
    //         $in: camp.reviews
    //     }
    // })
    req.flash("success","successfullly deleted the Location");
    res.redirect("/locations");

}


module.exports.addRoom = async (req,res)=>{
    const {id} = req.params;
    res.render("campground/addRoom" ,{id});
}


module.exports.roomAdd = async (req,res)=>{
    const {id} = req.params;
    const roomInfo = new room(req.body.roomInfo);
    const camp = await campground.findById(id);
    camp.rooms.push(roomInfo);
    roomInfo.hotelId = camp;
    await roomInfo.save();
    await camp.save();
    req.flash("success","Room Added Successfully");
    res.redirect(`/campground/${id}`);
}

module.exports.preview = async (req,res)=>{
    const {id} = req.params;
    
    const camp = await campground.findById(id).populate({
        path : "rooms"
    }).populate({
        path: "reviews",
        populate:{
            path:"author"
        }
    }).populate("author","username");

    const rooms = camp.rooms;
    
    res.send("Preview is not ready yet");

    // res.redirect(`/campground/${id}`);
}


module.exports.bookPage = async (req,res)=>{
    const {id} = req.params;
    const camp = await campground.findById(id).populate({
        path : "rooms"
    })
    const rooms = camp.rooms;
    // console.log(rooms);
    res.render("campground/bookPage" , {rooms,camp});
}

module.exports.roomBook = async(req,res)=>{
    const {id} = req.params;
    const roomx = await room.findById(id);
    const Bookings = roomx.bookings;
    const isoDates = [];
    for(let book of Bookings){
        for(let date of book.dates){
            isoDates.push(date);
        }
    }

    const Dates = isoDates.map(date => {
        // Ensure the date is a valid Date object
        const validDate = (date instanceof Date) ? date : new Date(date);
  
        // Format the date to 'YYYY-MM-DD'
        const year = validDate.getFullYear();
        const month = String(validDate.getMonth() + 1).padStart(2, '0');  // Month is 0-indexed, so add 1
        const day = String(validDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      });

    res.render("campground/bookRoom",{id,roomx,Dates});
}

module.exports.confirmBooking = async (req,res)=>{
    const {id} = req.params;
    const booker = req.body.user;

    const dateArray = req.body.dates.split(', ').map(dateStr => {
        const [month, day, year] = dateStr.split('/');  // Split the string into month, day, and year
        return new Date(year, month - 1, day);  // Create Date object (month is 0-indexed in JS)
    });

    const newDates = new DateModel({ dates: dateArray });
    booker.dates = newDates.dates;
    booker.user = req.user;
    const roomx = await room.findById(id);
    // console.log(booker);
    roomx.bookings.push(booker);
    roomx.save();
    // console.log(roomx);
    res.redirect(`/campground/${roomx.hotelId}/book`)
}

module.exports.preview = async (req,res)=>{
    const {id} = req.params;
    const camp = await campground.findById(id).populate({
        path : "rooms"
    });

    const rooms = camp.rooms;

    // for(let idx of camp.rooms){
    //     const roomx = await room.findById(idx._id).populate({
    //         path : "bookings"
    //     });
    //     console.log(roomx);
    // }

    // console.log(camp.rooms);
    res.render("campground/preview",{camp,rooms});
}