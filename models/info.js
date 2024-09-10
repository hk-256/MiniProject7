const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const InfoSchema = new Schema({

    location : {
        type: String
    },
    geometry:{
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }

})



module.exports = mongoose.model("Info",InfoSchema);