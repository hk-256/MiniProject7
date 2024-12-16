

const { ref, required, boolean, string } = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const opts = { toJSON: {virtuals: true}};

const roomSchema = new Schema(
    {
        roomNumber : {
            type : Number,
            required : true
        },
        typeOfRoom : {
            type : String,
            required : true
        },
        isOccupied : {
            type: String,
            default : "yes"
        },
        bookings :[{
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "user"
            },
            name : {
                type : String,
                required : true
            },
            addhar : {
                type : Number,
                required : true,
                max : 999999999999
            },
            phoneNumber :{
                type: Number,
                required : true,
                max : 9999999999
            },
            dates : [{
                type : Date
            }],
            note : {
                type : String
            }
        }],
        price : {
            type : Number,
            default : 100
        },
        hotelId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'campground'
        }
    }
)



module.exports = mongoose.model("Room",roomSchema);