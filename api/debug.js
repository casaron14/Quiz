module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const isDefault = !process.env.ADMIN_PASSWORD;
    
    return res.status(200).json({
        message: 'Debug info',
        passwordIsSet: !!process.env.ADMIN_PASSWORD,
        passwordMask: password.length > 0 ? '*'.repeat(password.length) : 'EMPTY',
        usingDefault: isDefault,
        nodeEnv: process.env.NODE_ENV
    });
};
