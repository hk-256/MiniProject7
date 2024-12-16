
const { ref, required, number } = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const opts = { toJSON: {virtuals: true}};


const solutionSchema = new Schema({

        numberOfVehicles : {
            type : Number 
        },
        Routes : [{
            Route : [{
                customerID : Number
            }]
        }],
        totalDistance : {
            type : Number
        }
   
},
{
    _id : false
});

const frontSchema = new Schema({

    frontNumber : {
        type : Number
    },
    solutions : [{
        // solutionSchema
        numberOfVehicles : {
            type : Number 
        },
        Routes : [{
            Route : [{
                customerID : Number
            }]
        }],
        totalDistance : {
            type : Number
        }
   
    }]
})


module.exports = mongoose.model("Fronts",frontSchema);

