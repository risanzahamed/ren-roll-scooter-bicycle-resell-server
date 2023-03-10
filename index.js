const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const stripe = require("stripe")(process.env.STRIPE_KEY);

// const jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000
require("dotenv").config()

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Kick Scooter and Bicycle server is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h3zxwhp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

console.log(uri);


async function run() {

    try {
        const productCategory= client.db('rentRoll').collection('productCategory')
        const newArrivals= client.db('rentRoll').collection('newArrivals')
        const productbyCategory= client.db('rentRoll').collection('allProductByCategory')
        const bestSellingProduct= client.db('rentRoll').collection('bestSellingProduct')
        const productAddToCartCollection = client.db('rentRoll').collection('productCart')
        const productflagedCollection = client.db('rentRoll').collection('flagedItems')
        const usersCollection = client.db('rentRoll').collection('users')
        const paymentCollection = client.db('rentRoll').collection('payment')
        const addProductCollection = client.db('rentRoll').collection('addProduct')



        app.post('/payment', async(req, res)=>{
            const payment = req.body
            const result = paymentCollection.insertOne(payment)
            const _id = payment.bookingId
            const filter = {_id : new ObjectId(_id)}
            const updatedDoc = {
                $set:{
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await productAddToCartCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })


        // // JWT CODE
        // app.get('/jwt', async (req, res) => {
        //     const email = req.query.email;
        //     const query = { email: email };
        //     const user = await usersCollection.findOne(query);

        //     if (user) {
        //         const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '5d' })
        //         return res.send({ accessToken: token })
        //     }
        //     res.status(403).send({ accessToken: '' })
        // })

        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productbyCategory.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })

        app.get('/product-category', async (req, res) => {
            const query = {}
            const cursor = productCategory.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })

        app.get('/product-category/:id', async (req, res) => {
            const id = req.params.id
            const query = { categoryName : id }
            const product = await productCategory.findOne(query)
            res.send(product)
        })


        app.get('/new-arivales', async (req, res) => {
            const query = {}
            const cursor = newArrivals.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })


        app.get('/new-arrivale/:id', async (req, res) => {
            const id = req.params.id
            const query = { model : id }
            const product = await newArrivals.findOne(query)
            res.send(product)
        })


        app.get('/best-selling', async (req, res) => {
            const query = {}
            const cursor = bestSellingProduct.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })


        app.get('/best-selling/:id', async (req, res) => {
            const id = req.params.id
            const query = { model : id }
            const product = await bestSellingProduct.findOne(query)
            res.send(product)
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id
            const query = { categoryName: id }
            const cars = await productbyCategory.find(query).toArray()
            res.send(cars)
        })

        app.post('/book-product', async (req, res) => {
            const carBooking = req.body

            const query = {
                email: carBooking.email,
                phone: carBooking.phone,
                image: carBooking.image,
                category: carBooking.category,
                model: carBooking.model,
                price: carBooking.price,
                location: carBooking.location
            }

            const result = await productAddToCartCollection.insertOne(query)
            res.send(result)
        })


        app.get('/book-product', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const carbookings = await productAddToCartCollection.find(query).toArray()
            res.send(carbookings)

        })


        // app.get('/book-product/:id', async (req, res) => {
        //     const id = req.params.id

        //     const query = { _id: new ObjectId(id) }

        //     const result = await productAddToCartCollection.findOne(query)
        //     res.send(result)
        // })

        // app.get('/book-product', async (req, res) => {
        //     const query = {}
        //     const cursor = productAddToCartCollection.find(query)
        //     const service = await cursor.toArray()
        //     res.send(service)
        // })


        app.get('/book-product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id : new ObjectId(id)}
            const product = await productAddToCartCollection.findOne(query)
            res.send(product)
        })


        app.post('/flag-items', async (req, res) => {
            const flaged = req.body

            const query = {
                image: flaged.image,
                model: flaged.model,
                category: flaged.categoryName,
                description: flaged.description,
                resalePrice: flaged.resalePrice,
                originalPrice: flaged.originalPrice,
                postDate: flaged.postDate,
                yearsOfUse: flaged.yearsOfUse,
                location: flaged.location,
            }

            const result = await productflagedCollection.insertOne(query)
            res.send(result)
        })


        app.get('/flag-items', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const carbookings = await productflagedCollection.find(query).toArray()
            res.send(carbookings)

        })

        app.post('/user', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        app.get('/user', async (req, res) => {
            const query = {}
            const cursor = usersCollection.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })

        app.get("/user/:email", async (req, res) => {
            const email = req.params.email;
      
            const result = await usersCollection.findOne({ email });
      
            if (result?.email) {
              return res.send({ status: true, data: result });
            }
      
            res.send({ status: false });
          });
          app.get('/user/:id', async (req, res) => {
            const id = req.params.id

            const query = { role : new ObjectId(id) }

            const result = await usersCollection.findOne(query)
            res.send(result)
        })
          app.get('/user/:id', async (req, res) => {
            const role = req.params.role

            const query = { role : new ObjectId(role) }

            const result = await usersCollection.find(query)
            res.send(result)
        })


        app.post("/create-payment-intent", async (req, res) => {
            const carbooking = req.body;
            const price = carbooking.price
            const amount = price * 100

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                "payment_method_types": [
                    "card"
                ],
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        

        app.post('/add-product', async (req, res) => {
            const product = req.body
            const result = await addProductCollection.insertOne(product)
            res.send(result)
        })

        app.get('/add-product', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await addProductCollection.find(query).toArray()
            res.send(result)
        })
    }

    finally {

    }

}

run()

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})