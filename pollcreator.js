
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectID = require('mongodb').ObjectId;

const LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1rk65.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

exports.createPollGetController = (req, res, next) => {
    res.render('create.ejs')
}


exports.createPollPostController = async (req, res, next) => {
    await client.connect()
    const pollCollection = client.db("Poll_creation").collection("Polls")
    const { title, description, options } = req.body;

    let option = options.map(opt => {
        return {
            name: opt,
            vote: 0
        }
    })

    let poll = {
        title,
        description,
        option,
        totalVote: 0,
    }

    try {
        const result = await pollCollection.insertOne(poll)
        res.redirect('/polls');
    }
    catch (e) {
        console.log(e)
    }
}




exports.getAllPolls = async (req, res, next) => {

    await client.connect()
    const pollCollection = client.db("Poll_creation").collection("Polls")
    try {
        let polls = await pollCollection.find({}).toArray();
        res.render('polls.ejs', { polls })

    }
    catch (e) {
        console.log(e)
    }

}



exports.viewPollGetController = async (req, res, next) => {
    await client.connect()
    const pollCollection = client.db("Poll_creation").collection("Polls")
    let id = req.params.id;
    try {
        const filter = { _id: ObjectID(id) }
        const poll = await pollCollection.findOne(filter);
        let result = [];
        const options = poll.option;
        const totalVote = poll.totalVote;
        options.forEach(element => {
            let percentage = (element.vote * 100) / totalVote;
            result.push({
                name: element.name,
                percentage: percentage ? Math.round(percentage) : 0,
            })
        });

        res.render("viewpoll.ejs", { poll, result })
    }
    catch (e) {
        console.log(e)
    }
}


exports.viewPollPostController = async (req, res, next) => {
    const number = JSON.parse(localStorage.getItem("KEY"));

    await client.connect()
    const pollCollection = client.db("Poll_creation").collection("Polls")
    let id = req.params.id;
    const name = req.body.option;
    try {
        const options = { upsert: true }
        const filter = { _id: ObjectID(id) }


        // get the selected poll 
        const poll = await pollCollection.findOne(filter);
        const option = poll.option;
        let choosedOpiton = option.findIndex(opt => opt.name === name)
        option[choosedOpiton].vote = option[choosedOpiton].vote + 1;
        let totalVote = poll.totalVote;


        // update all the data given by user 
        const updateDoc = {
            $set: {
                option: option,
                totalVote: parseInt(totalVote + 1),
            }
        }
        const result = await pollCollection.updateOne(filter, updateDoc, options);
        const number = `f68e58a78aaa069f579416e8fcf669bccd5628`;
        localStorage.setItem("KEY", JSON.stringify(number));
        res.redirect("/polls/" + id);
    }
    catch (e) {
        console.log(e)
    }

}