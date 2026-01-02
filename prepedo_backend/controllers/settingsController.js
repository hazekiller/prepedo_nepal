const { promisePool } = require('../config/database');

// @desc    Get all system settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
const getSettings = async (req, res) => {
    try {
        const [settings] = await promisePool.query('SELECT * FROM system_settings');

        // Convert array to object
        const settingsObj = {};
        settings.forEach(item => {
            settingsObj[item.setting_key] = item.setting_value;
        });

        res.json({
            success: true,
            data: settingsObj
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
const updateSettings = async (req, res) => {
    const connection = await promisePool.getConnection();

    try {
        await connection.beginTransaction();

        const updates = req.body;

        for (const [key, value] of Object.entries(updates)) {
            await connection.query(
                'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, String(value), String(value)]
            );
        }

        await connection.commit();

        // Fetch updated settings
        const [settings] = await connection.query('SELECT * FROM system_settings');
        const settingsObj = {};
        settings.forEach(item => {
            settingsObj[item.setting_key] = item.setting_value;
        });

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settingsObj
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    getSettings,
    updateSettings
};
