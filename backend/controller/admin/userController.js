const User = require('../../models/userModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Get all users with optional role filter
 */
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users', error });
  }
};

/**
 * Block or unblock a user
 */
const toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.blocked = !user.blocked;
    await user.save();

    res.status(200).json({ message: `User has been ${user.blocked ? 'blocked' : 'unblocked'}` });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking/unblocking user', error });
  }
};

/**
 * Delete a user
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

/**
 * Assign a role to a user
 */
const assignRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    res.status(200).json({ message: `Role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning role', error });
  }
};

/**
 * Export users as PDF or Excel
 */
const exportUsers = async (req, res) => {
  try {
    const { format, role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter);

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="users_report.pdf"');
      doc.pipe(res);

      doc.fontSize(20).text('Users Report', { align: 'center' });
      doc.moveDown();

      users.forEach(user => {
        doc.fontSize(12).text(`Name: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`Role: ${user.role}`);
        doc.text(`Location: ${user.location?.address}`);
        doc.moveDown();
      });

      doc.end();

    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');

      worksheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Location', key: 'location', width: 35 }
      ];

      users.forEach(user => {
        worksheet.addRow({
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location?.address || 'N/A'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="users_report.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).json({ message: 'Invalid format. Use pdf or excel' });
    }

  } catch (error) {
    res.status(500).json({ message: 'Error exporting users', error });
  }
};

module.exports = {
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  assignRole,
  exportUsers
};
