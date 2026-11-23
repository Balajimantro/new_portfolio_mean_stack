const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const { ObjectId } = require('mongodb');

const config = require('../config/env');
const { getDb } = require('../mongoDb');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const BCRYPT_ROUNDS = 12;

function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '12h' });
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function requirePortfolioDoc() {
  const collection = getDb().collection('PersonalData');
  const doc = await collection.findOne({});
  if (!doc) throw httpError(404, 'Portfolio document not found');
  return { collection, doc };
}

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await getDb().collection('users').findOne({ userName: username });
  if (!user) {
    // Keep timing roughly constant for unknown users.
    await bcrypt.compare(password, '$2a$12$C6UzMDM.H6dfI/f/IKcEeO7ZK0dQ8l9Z0F7G6yG6tH0Qr5S7h2J5u');
    throw httpError(401, 'Invalid credentials');
  }

  let isMatch = false;

  if (user.passwordHash) {
    isMatch = await bcrypt.compare(password, user.passwordHash);
  } else if (user.password) {
    // Legacy plaintext record: verify once, then upgrade to bcrypt.
    isMatch = password === user.password;
    if (isMatch) {
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await getDb()
        .collection('users')
        .updateOne({ _id: user._id }, { $set: { passwordHash }, $unset: { password: '' } });
    }
  }

  if (!isMatch) {
    throw httpError(401, 'Invalid credentials');
  }

  const token = signToken({ userId: user._id.toString(), username: user.userName, role: 'admin' });

  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 12 * 60 * 60 * 1000
  });

  return res.json({ success: true });
};

exports.me = async (req, res) => res.json({ user: req.user || null });

exports.logout = async (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'none' : 'lax',
    path: '/'
  });
  return res.json({ success: true });
};

exports.addSkill = async (req, res) => {
  const { collection, doc } = await requirePortfolioDoc();

  const newSkill = {
    id: new ObjectId().toString(),
    technology: req.body.technology,
    level: req.body.level,
    languages: req.body.languages || []
  };

  await collection.updateOne({ _id: doc._id }, { $push: { skills: newSkill } });
  return res.status(201).json(newSkill);
};

exports.updateSkill = async (req, res) => {
  const { collection, doc } = await requirePortfolioDoc();
  const { id } = req.params;

  if (!(doc.skills || []).some((skill) => skill.id === id)) {
    throw httpError(404, 'Skill not found');
  }

  await collection.updateOne(
    { _id: doc._id },
    {
      $set: {
        'skills.$[el]': {
          id,
          technology: req.body.technology,
          level: req.body.level,
          languages: req.body.languages || []
        }
      }
    },
    { arrayFilters: [{ 'el.id': id }] }
  );

  return res.json({ id, ...req.body });
};

exports.deleteSkill = async (req, res) => {
  const { collection, doc } = await requirePortfolioDoc();

  if (!(doc.skills || []).some((skill) => skill.id === req.params.id)) {
    throw httpError(404, 'Skill not found');
  }

  await collection.updateOne({ _id: doc._id }, { $pull: { skills: { id: req.params.id } } });

  return res.json({ success: true });
};

exports.addProject = async (req, res) => {
  const { collection, doc } = await requirePortfolioDoc();

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
  return res.status(201).json(newProject);
};

exports.updateProject = async (req, res) => {
  const { collection, doc } = await requirePortfolioDoc();
  const { id } = req.params;

  if (!(doc.projects || []).some((project) => project.id === id)) {
    throw httpError(404, 'Project not found');
  }

  await collection.updateOne(
    { _id: doc._id },
    {
      $set: {
        'projects.$[el]': {
          id,
          title: req.body.title,
          description: req.body.description,
          technology: req.body.technology || [],
          image: req.body.image || '',
          githubLink: req.body.githubLink || '',
          publishLink: req.body.publishLink || ''
        }
      }
    },
    { arrayFilters: [{ 'el.id': id }] }
  );

  return res.json({ id, ...req.body });
};

exports.deleteProject = async (req, res) => {
  const { collection, doc } = await requirePortfolioDoc();

  if (!(doc.projects || []).some((project) => project.id === req.params.id)) {
    throw httpError(404, 'Project not found');
  }

  await collection.updateOne({ _id: doc._id }, { $pull: { projects: { id: req.params.id } } });

  return res.json({ success: true });
};

exports.getContactSubmissions = async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

  const data = await getDb()
    .collection('contactUsData')
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return res.json(data);
};

exports.updateProfile = async (req, res) => {
  const { collection, doc } = await requirePortfolioDoc();
  const allowed = ['gitHubProfileLink', 'linkdinProfileLink', 'mailId', 'cvLink'];

  const set = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      set[key] = req.body[key];
    }
  }

  if (Object.keys(set).length === 0) {
    throw httpError(400, 'No profile fields provided');
  }

  await collection.updateOne({ _id: doc._id }, { $set: set });
  return res.json(set);
};

exports.uploadCv = async (req, res) => {
  if (!req.file) throw httpError(400, 'CV file is required');

  const { collection, doc } = await requirePortfolioDoc();

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'portfolio-cv/latest-cv',
        resource_type: 'raw',
        overwrite: true,
        format: 'pdf',
        public_id: `balaji-cv-${Date.now()}`
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  const previousPublicId = doc.resume?.publicId || doc.resume?.cvPublicId;
  if (previousPublicId) {
    cloudinary.uploader
      .destroy(previousPublicId, { resource_type: 'raw' })
      .catch((error) => console.warn('[cloudinary] old CV cleanup failed:', error.message));
  }

  const resume = {
    cvLink: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    fileName: path.basename(req.file.originalname || 'cv.pdf')
  };

  await collection.updateOne({ _id: doc._id }, { $set: { resume } });

  return res.json({ success: true, resume });
};
