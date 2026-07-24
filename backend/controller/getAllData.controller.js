const https = require("https");
const cloudinary = require("cloudinary").v2;
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

exports.streamCv = async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection("PersonalData");
        const doc = await collection.findOne({});

        if (!doc || !doc.cvPublicId) {
            return res.status(404).json({ message: "CV not found" });
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const cvUrl = cloudinary.url(doc.cvPublicId, {
            secure: true,
            resource_type: "raw",
            format: "pdf"
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=\"cv.pdf\"");

        https.get(cvUrl, (cvRes) => {
            if (cvRes.statusCode && cvRes.statusCode >= 400) {
                return res.status(500).json({ message: "Failed to fetch CV" });
            }
            cvRes.pipe(res);
        }).on("error", () => {
            res.status(500).json({ message: "Failed to fetch CV" });
        });
    } catch (error) {
        res.status(500).json({ message: "Error streaming CV", error });
    }
};
