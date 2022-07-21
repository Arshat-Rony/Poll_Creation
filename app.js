const express = require("express")
const mongoose = require("mongoose")
const morgan = require("morgan")
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const pollCreator = require('./pollcreator')

const port = process.env.PORT || 8000;


const app = express()


app.set('view engine', 'ejs')

app.use(morgan("dev"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1rk65.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




// root route
app.get("/", (req, res) => {
    res.render('create.ejs');
})


//poll route
app.get("/create", pollCreator.createPollGetController)
app.post("/create", pollCreator.createPollPostController)
app.get("/polls", pollCreator.getAllPolls)
app.get("/polls/:id", pollCreator.viewPollGetController)
app.post("/polls/:id", pollCreator.viewPollPostController)



app.listen(port, () => {
    console.log("Application is listening in port", port)
})




