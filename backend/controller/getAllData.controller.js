const { getDb } = require("../mongoDb");

exports.getAllData = async(req, res) => {
    try {
        const db = getDb();
        const collection = db.collection("PersonalData");
        const data = await collection.find({}).toArray();

        if(!data) {
            res.status(404).json("Data not found in db");
        }

        res.json(data);
    } catch(error) {
        res.status(500).json(error);
    }
}

