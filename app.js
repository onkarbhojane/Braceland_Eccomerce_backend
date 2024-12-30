import express from 'express';
import conn from './DB/conn.js'; // Ensure conn.js exists and is exported properly
import { jwtAuthMiddleware, generateToken } from './Auth/Auth.js'; // Ensure these are correctly exported
import user from './models/user.models.js'; // Ensure the user model is correctly defined
import cors from 'cors'
import Queries from './models/Queries.models.js';
import Story from './models/Strory.models.js';
import product from './models/Products.models.js';
import Review from './models/Review.models.js';
import Order from './models/Orders.models.js';
// Establish database connection
import 'dotenv/config'
// require('dotenv').config();

const PORT = process.env.PORT;
const DB_PASS = process.env.PASS;
const USER_ID = process.env.ID;

if (!PORT || !DB_PASS || !USER_ID) {
    throw new Error("Missing required environment variables");
}

conn('BraceLet');
// Create an Express application
const app = express();
app.use(cors())

// Middleware for parsing JSON
app.use(express.json()); // Important for handling JSON request bodies

// Sign-up endpoint
app.post('/signup', async (req, res) => {
  try {
    console.log("PPPPPPPPPPPPPPPP", req.body)
    const { Name, Email, password } = req.body;

    // Validate input
    if (!Name || !Email || !password) {
      return res.status(400).json({ message: 'Name and Email are required' });
    }

    // Create a new user
    const user1 = new user({
      userName: Name,
      EmailId: Email,
      password: password
    });

    // Generate a token
    const payLoad = { userName: Name, EmailId: Email };
    const Token = generateToken(payLoad);

    const doc = await user1.save();
    console.log('User created successfully:', doc);

    res.status(201).json({ Token });
  } catch (error) {
    console.error('Error in user creation:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/login', (req, res) => {
  user.findOne({ password: req.body.password, EmailId: req.body.Email })
    .then((doc) => {
      const payLoad = { userName: doc.userName, EmailId: req.body.Email }
      const Token = generateToken(payLoad);
      console.log(payLoad,)
      res.status(201).json({ Token });
    })
    .catch((error) => {
      console.error('Error in finding user :', error);
      res.status(500).json({ message: 'Internal Server Error' });
    })
})

app.post('/Queries', (req, res) => {
  const { name, email, message } = req.body;
  const queury = new Queries();
  queury.Name = name;
  queury.EmailId = email;
  queury.Message = message
  queury.save()
    .then((doc) => {
      console.log("queuries saved successfully ", doc);
      res.status(201);
    })
    .catch((error) => {
      console.log("error in saving queury please resend>>>>>");
      res.status(501);
    })
})

app.get('/Story', (req, res) => {
  Story.aggregate([
    { $sample: { size: 4 } },  // Randomly select 4 documents
    { $project: { src: 1 } }    // Only include the 'src' field containing the image URL
  ])
    .then((docs) => {
      const images = docs.map(doc => doc.src);

      res.status(201).json({ images });
    })
    .catch((error) => {
      console.log("Error in fetching story data: ", error);
      res.status(501).send("Error fetching story data.");
    });
});

// app.post('/save', async (req, res) => {
//     console.log(req.body)
//     try {
//       const Reviews = req.body; // Array of products
//       if (!Array.isArray(Reviews)) {
//         return res.status(400).json({ message: 'Data must be an array of products' });
//       }
//       await Review.insertMany(Reviews);
//       res.status(201).json({ message: 'Products saved successfully' });
//     } catch (error) {
//       console.error('Error saving products:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
// });

app.get('/testimonials', (req, res) => {
  console.log(req.body);
  Review.aggregate([
    { $sample: { size: 3 } }   // Only include the 'src' field containing the image URL
  ])
    .then((docs) => {
      res.status(201).json({ docs });
    })
    .catch((error) => {
      console.log("Error in fetching story data: ", error);
      res.status(501).send("Error fetching story data.");
    });
})

app.get('/FetchProducts', (req, res) => {
  // console.log(req.body)
  product.aggregate([
    { $sample: { size: 8 } },  // Randomly select 4 documents
  ])
    .then((docs) => {
      res.status(201).json({ docs });
    })
    .catch((error) => {
      console.log("Error in fetching story data: ", error);
      res.status(501).send("Error fetching story data.");
    });
});
app.get('/ExploreContent', (req, res) => {
  product.aggregate([
    { $sample: { size: 15 } },  // Randomly select 4 documents
  ])
    .then((docs) => {
      res.status(201).json({ docs });
    })
    .catch((error) => {
      console.log("Error in fetching story data: ", error);
      res.status(501).send("Error fetching story data.");
    });
})


app.post('/AddCart', jwtAuthMiddleware, async (req, res) => {
  try {
    // Log the decoded user payload to ensure it's working
    console.log(req.userPayload);

    // Extract user details from the decoded token
    const { userName, EmailId } = req.userPayload;
    const { _id } = req.body;  // Assuming the product ID comes in the request body

    // Find the user in the database
    const user1 = await user.findOne({ userName, EmailId });

    // If the user is not found, send an error response
    if (!user1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Push the product ID into the user's cart
    user1.Cart.push(req.body.product);  // Assuming "cart" is the array where products are stored

    await user1.save();

    res.status(201).json({ message: 'Product added to cart' });

  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/Order', jwtAuthMiddleware, async (req, res) => {
  try {
      const { userName, EmailId } = req.userPayload;
      const user1 = await user.findOne({ userName, EmailId });

      const order = new Order();
      order.UserId = user1._id;
      order.Product.push(...req.body.product);
      order.PaymentMethod = req.body.paymentMethod;

      // Extract and concatenate address details
      const { street, city, state, zipCode } = req.body.addressDetails;  // Assuming addressDetails is an object
      const addressString = `${street}, ${city}, ${state}, ${zipCode}`;  // Concatenate all fields into one string
      order.Address = addressString;

      // Save the order
      const ord = await order.save();
      user1.Orders.push(ord._id);
      await user1.save();

      res.status(201).json({ message: 'Order placed successfully', order: ord });
  } catch (error) {
      console.error("Error placing order:", error);
      res.status(500).json({ error: 'Something went wrong while placing the order' });
  }
});



app.get('/getOrders', jwtAuthMiddleware, async (req, res) => {
  console.log(req.userPayload)
  try {
    const { userName, EmailId } = req.userPayload;

    // Find the user by userName and EmailId
    const user1 = await user.findOne({ userName, EmailId });
    console.log(userName)
    // Ensure user is found
    if (!user1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the orders using the order IDs stored in user.Orders
    const orderIds = user1.Orders;  // Assuming 'Orders' is an array of order IDs

    // Use $in operator to query multiple orders
    const data = await Order.find({
      _id: { $in: orderIds }
    });
    console.log("ddddddddddddddddddd", data);
    // Send the orders data as a response
    res.status(201).json(data);

  } catch (error) {
    console.log("Error in fetching orders: ", error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});



app.post('/cancelOrder/:orderId', jwtAuthMiddleware, async (req, res) => {
  const { orderId } = req.params;

  try {
    // Extract user info from the JWT payload
    const { userId, userName, EmailId } = req.userPayload;  // Assuming these are present in the JWT payload

    // Find the order by ID and check if it belongs to the logged-in user
    const order = await Order.findOneAndUpdate(
      { _id: orderId, User: userId }, // Match order with the logged-in user
      { Status: 'canceled' }, // Set the order status to 'canceled'
      { new: true } // Return the updated order
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found or you do not have permission to cancel it' });
    }

    await user.findOneAndUpdate(
      { _id: userId },
      { $pull: { Orders: orderId } }
    );

    await Order.findByIdAndDelete(orderId);  

    res.status(200).json({ message: 'Order canceled successfully', order });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error in canceling order' });
  }
});


app.get('/getCart', jwtAuthMiddleware, async (req, res) => {
  try {
    const { userName, EmailId } = req.userPayload;

    const user1 = await user.findOne({ userName, EmailId });
    
    const data = user1.Cart;

    res.status(200).json(data);  
  } catch (error) {
    console.log("Error in fetching cart data: ", error);
    res.status(500).json({ error: "Error in fetching cart data" });
  }
});

app.get('/user/profile',jwtAuthMiddleware,async(req,res)=>{
  try{
    const { userName, EmailId } = req.userPayload;

    // Find the user by userName and EmailId
    const user1 = await user.findOne({ userName, EmailId });
    res.status(200).json(user1)
  }catch(error){
    console.log('error in fetching profile, ',error)
    res.status(500).json({ error: "Error in fetching cart data" });
  }
})
app.listen(process.env.PORT, () => {
  console.log('Listening on port 3000...');
});
