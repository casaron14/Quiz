module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const isDefault = !process.env.ADMIN_PASSWORD;
    
    // List all environment variables that start with KV or ADMIN
    const kvVars = {};
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('KV_') || key.startsWith('ADMIN')) {
            kvVars[key] = key.includes('TOKEN') || key.includes('PASSWORD') 
                ? '***' + process.env[key].slice(-4)  // Show last 4 chars for tokens
                : process.env[key];
        }
    });
    
    return res.status(200).json({
        message: 'Debug info',
        adminPassword: {
            isSet: !!process.env.ADMIN_PASSWORD,
            length: password.length,
            mask: '*'.repeat(password.length),
            usingDefault: isDefault,
            defaultValue: isDefault ? 'admin123' : 'Custom value set'
        },
        kvStorage: {
            configured: !!process.env.KV_REST_API_URL,
            vars: kvVars
        },
        environment: process.env.NODE_ENV || 'development'
    });
};
