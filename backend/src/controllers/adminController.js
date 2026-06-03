const AdminService = require('../services/adminService');

const fillImages = async (req, res, next) => {
  try {
    const updated = await AdminService.fillImages();
    return res.json({ success: true, updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { fillImages };
