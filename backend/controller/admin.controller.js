const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const { getDb } = require('../mongoDb');

async function getPortfolioDoc() {
  const db = getDb();
  const collection = db.collection('PersonalData');
  const doc = await collection.findOne({});
  return { collection, doc };
}

function signToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev_secret';
  return jwt.sign(payload, secret, { expiresIn: '12h' });
}

function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

exports.login = async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const db = getDb();
  const usersCollection = db.collection('users');
  const user = await usersCollection.findOne({ userName: username });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordHash = user.passwordHash || '';
  let isPasswordMatch = false;

  if (passwordHash) {
    isPasswordMatch = await bcrypt.compare(password, passwordHash);
  } else if (user.password) {
    isPasswordMatch = password === user.password;
  }

  if (!isPasswordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ userId: user._id.toString(), username: user.userName, role: 'admin' });
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 12 * 60 * 60 * 1000
  });
  return res.json({ success: true });
};

exports.addSkill = async (req, res) => {
  try {
    const { collection, doc } = await getPortfolioDoc();
    if (!doc) {
      return res.status(404).json({ message: 'Portfolio document not found' });
    }

    const newSkill = {
      id: new ObjectId().toString(),
      technology: req.body.technology,
      level: req.body.level,
      languages: req.body.languages || []
    };

    await collection.updateOne({ _id: doc._id }, { $push: { skills: newSkill } });
    return res.json(newSkill);
  } catch (error) {
    return res.status(500).json({ message: 'Error adding skill', error });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    const { collection, doc } = await getPortfolioDoc();
    if (!doc) {
      return res.status(404).json({ message: 'Portfolio document not found' });
    }

    const { id } = req.params;
    const updated = {
      id,
      technology: req.body.technology,
      level: req.body.level,
      languages: req.body.languages || []
    };

    const skills = (doc.skills || []).map((skill) => (skill.id === id ? updated : skill));
    await collection.updateOne({ _id: doc._id }, { $set: { skills } });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating skill', error });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const { collection, doc } = await getPortfolioDoc();
    if (!doc) {
      return res.status(404).json({ message: 'Portfolio document not found' });
    }

    const { id } = req.params;
    const skills = (doc.skills || []).filter((skill) => skill.id !== id);
    await collection.updateOne({ _id: doc._id }, { $set: { skills } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting skill', error });
  }
};

exports.addProject = async (req, res) => {
  try {
    const { collection, doc } = await getPortfolioDoc();
    if (!doc) {
      return res.status(404).json({ message: 'Portfolio document not found' });
    }

    const newProject = {
      id: new ObjectId().toString(),
      title: req.body.title,
      description: req.body.description,
      technology: req.body.technology || [],
      image: req.body.image || '',
      githubLink: req.body.githubLink || '',
      publishLink: req.body.publishLink || ''
    };

    await collection.updateOne({ _id: doc._id }, { $push: { projects: newProject } });
    return res.json(newProject);
  } catch (error) {
    return res.status(500).json({ message: 'Error adding project', error });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { collection, doc } = await getPortfolioDoc();
    if (!doc) {
      return res.status(404).json({ message: 'Portfolio document not found' });
    }

    const { id } = req.params;
    const updated = {
      id,
      title: req.body.title,
      description: req.body.description,
      technology: req.body.technology || [],
      image: req.body.image || '',
      githubLink: req.body.githubLink || '',
      publishLink: req.body.publishLink || ''
    };

    const projects = (doc.projects || []).map((project) => (project.id === id ? updated : project));
    await collection.updateOne({ _id: doc._id }, { $set: { projects } });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating project', error });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { collection, doc } = await getPortfolioDoc();
    if (!doc) {
      return res.status(404).json({ message: 'Portfolio document not found' });
    }

    const { id } = req.params;
    const projects = (doc.projects || []).filter((project) => project.id !== id);
    await collection.updateOne({ _id: doc._id }, { $set: { projects } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting project', error });
  }
};

exports.getContactSubmissions = async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('contactUsData');
    const data = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching contact submissions', error });
  }
};

exports.me = async (req, res) => {
  return res.json({ user: req.user || null });
};

exports.logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  return res.json({ success: true });
};

exports.updateProfile = async (req, res) => {
  try {
    const { collection, doc } = await getPortfolioDoc();
    if (!doc) {
      return res.status(404).json({ message: 'Portfolio document not found' });
    }

    const payload = {
      gitHubProfileLink: req.body.gitHubProfileLink || '',
      linkdinProfileLink: req.body.linkdinProfileLink || '',
      mailId: req.body.mailId || '',
      cvLink: req.body.cvLink || ''
    };

    await collection.updateOne({ _id: doc._id }, { $set: payload });
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile', error });
  }
};

exports.uploadCv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CV file is required' });
    }

    console.log('Received file:', req.file);

    initCloudinary();
    const { collection, doc } = await getPortfolioDoc();
    if (!doc) {
      return res.status(404).json({ message: 'Portfolio document not found' });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio-cv/latest-cv',
          resource_type: 'raw', // IMPORTANT for PDF
          overwrite: true,
          format: 'pdf'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const payload = {
      resume: {
        cvLink: uploadResult.secure_url,
        fileName: req.file.originalname,
        publicId: uploadResult.public_id
      }
    };

    await collection.updateOne({ _id: doc._id }, { $set: payload });
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: 'Error uploading CV', error });
  }
};
