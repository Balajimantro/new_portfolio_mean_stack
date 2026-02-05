const { ObjectId } = require("mongodb");
const { getDb } = require("../mongoDb");

exports.getAllData = async(req, res) => {
    try {
        const db = getDb();
        const collection = db.collection("PersonalData");
        const data = await collection.find({}).toArray();


        if(!data || data.length === 0) {
            res.status(404).json("Data not found in db");
        }

        const doc = data[0];
        if (doc) {
            let updated = false;

            if (Array.isArray(doc.skills)) {
                doc.skills = doc.skills.map((skill) => {
                    if (!skill.id) {
                        updated = true;
                        return { ...skill, id: new ObjectId().toString() };
                    }
                    return skill;
                });
            }

            if (Array.isArray(doc.projects)) {
                doc.projects = doc.projects.map((project) => {
                    if (!project.id) {
                        updated = true;
                        return { ...project, id: new ObjectId().toString() };
                    }
                    return project;
                });
            }

            if (updated) {
                await collection.updateOne({ _id: doc._id }, { $set: { skills: doc.skills, projects: doc.projects } });
            }
        }

        res.json(data);
    } catch(error) {
        res.status(500).json(error);
    }
}
