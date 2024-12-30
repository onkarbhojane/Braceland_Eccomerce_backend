import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.ObjectId,
        required: true, // You can add validation like required to ensure the field is always provided
        ref: 'User' // Assuming you want to reference the 'User' model here
    },
    Product: [{
        Name: {
            type: String,
            required: true // You can add validations here too
        },
        FullName: {
            type: String,
            required: true
        },
        price: {
            type: String,
            required: true
        },
        img: {
            type: String,
            required: true
        }
    }],
    PaymentMethod: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    }
});

const Order = mongoose.model("Order", Schema);

export default Order;
