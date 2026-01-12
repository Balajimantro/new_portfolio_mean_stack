const { getDb } = require("../mongoDb");

exports.saveContactUsData = async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection('contactUsData');
        
        const data = {
            ...req.body,
            createdAt: new Date().toISOString()
        };

        const result = await collection.insertOne(data);
        res.json({
                success: true,
                message: 'Contact form submitted successfully',
                id: result.insertedId
            });

    } catch(error) {
        res.status(500).json('error saving the contact us data', error);
    }
}