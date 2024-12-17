const userController = {};
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const ResponseAPI = require('../utils/response');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

userController.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
        return ResponseAPI.error(res, 'Email tidak valid');
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return ResponseAPI.error(res, 'User dengan email tersebut tidak ditemukan');
        }

        // Buat token untuk reset password
        const token = jwt.sign(
            { id: user._id, purpose: 'reset-password' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token hanya berlaku selama 1 jam
        );

        // Simpan token dan tanggal kedaluwarsa di database
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Token valid untuk 1 jam
        await user.save();

        // Kirim email dengan token
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            debug: true,
        });

        const mailOptions = {
            from: `"Ceria Music Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Atur Ulang Password Anda - Ceria Music',
            text: `Halo,\n\nSilakan klik tautan berikut untuk mengatur ulang password Anda:\n\nhttp://localhost:5173/reset-password/${token}\n\nTautan ini akan kedaluwarsa dalam waktu 1 jam.\n\nJika Anda tidak merasa melakukan permintaan ini, abaikan email ini.\n\nTerima kasih,  \nTim Ceria Music`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #007bff; text-align: center;">Atur Ulang Password Anda</h2>
                <p style="text-align: center; margin: 20px 0;">Halo,</p>
                <p style="text-align: center; margin: 10px 0;">
                    Silakan klik tombol di bawah ini untuk mengatur ulang password Anda.
                </p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="http://localhost:5173/reset-password/${token}" 
                       style="display: inline-block; padding: 12px 30px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px; font-size: 16px; transition: background-color 0.3s ease;">
                        Atur Ulang Password
                    </a>
                </div>
                <p style="text-align: center; margin: 10px 0; font-size: 14px; color: #555;">
                    Tautan ini akan kedaluwarsa dalam waktu 1 jam.
                </p>
                <p style="text-align: center; margin: 20px 0; font-size: 14px; color: #555;">
                    Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.
                </p>
                <div style="text-align: center; margin: 20px 0; font-size: 14px; color: #555;">
                    Terima kasih, <br>
                    Tim Ceria Music
                </div>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);

        ResponseAPI.success(res, { token }, 'Email reset password berhasil dikirim');
    } catch (error) {
        console.error(error);
        ResponseAPI.serverError(res, error.message || 'Terjadi kesalahan server');
    }
};

// Validasi token reset password
userController.validateResetToken = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.purpose !== 'reset-password') {
            return ResponseAPI.error(res, 'Token tidak valid');
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return ResponseAPI.error(res, 'Token tidak valid atau sudah kedaluwarsa');
        }

        ResponseAPI.success(res, { token });
    } catch (error) {
        console.error(error);
        ResponseAPI.error(res, 'Token tidak valid');
    }
};

// Proses reset password
userController.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    console.log('Token yang diterima:', token);
    console.log('Password yang diterima:', newPassword);

    if (!token || !newPassword) {
        return ResponseAPI.error(res, 'Token dan password baru harus diisi');
    }

    if (newPassword.length < 8) {
        return ResponseAPI.error(res, 'Password baru harus minimal 8 karakter');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.purpose !== 'reset-password') {
            return ResponseAPI.error(res, 'Token tidak valid');
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return ResponseAPI.error(res, 'Token tidak valid atau sudah kedaluwarsa');
        }

        // Langsung set `newPassword`, middleware akan menangani hashing
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        ResponseAPI.success(res, null, 'Password berhasil diperbarui');
    } catch (error) {
        console.error(error);
        ResponseAPI.error(res, 'Token tidak valid');
    }
};

userController.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return ResponseAPI.error(res, 'Email dan password harus diisi');
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return ResponseAPI.unauthorized(res, 'User tidak ditemukan');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return ResponseAPI.unauthorized(res, 'Password salah');
        }

        const token = user.generateAuthToken();

        ResponseAPI.success(res, {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                photo: user.photo
            }
        });
    } catch (error) {
        ResponseAPI.serverError(res, error);
    }
};
userController.updateProfile = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = req.user.id;

        const updateData = {};

        if (username) updateData.username = username;

        if (email) updateData.email = email;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 12);
            updateData.password = hashedPassword;
        }

        if (req.file) {
            const user = await User.findById(userId);

            if (user.photo) {
                const oldPhotoPath = path.join(user.photo.replace(/\\/g, '/'));
                console.log('Old photo path:', oldPhotoPath);

                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                    console.log('Old photo deleted');
                } else {
                    console.log('Old photo does not exist');
                }
            }

            updateData.photo = req.file.path.replace(/\\/g, '/');
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return ResponseAPI.error(res, 'User tidak ditemukan', 404);
        }

        ResponseAPI.success(res, user, 'Profil berhasil diperbarui');
    } catch (error) {
        ResponseAPI.serverError(res, error);
    }
};

userController.getUser = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        const user = await User.findById(userId).select('-password'); 

        if (!user) {
            return ResponseAPI.error(res, 'User tidak ditemukan', 404);
        }

        ResponseAPI.success(res, user, 'Profil pengguna berhasil diambil');
    } catch (error) {
        console.error(error);
        ResponseAPI.serverError(res, error);
    }
};

userController.logout = async (req, res) => {
    try {
        ResponseAPI.success(res, null, 'Logout berhasil');
    } catch (error) {
        ResponseAPI.serverError(res, error);
    }
};

module.exports = userController;
