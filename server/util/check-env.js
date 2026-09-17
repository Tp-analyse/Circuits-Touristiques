const checkEnv = () => {
    const required = process.env.MYSQLCONNSTR_localdb
        ? ['JWT_SECRET']
        : ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];

    const problems = [];
    for (const name of required) {
        const value = process.env[name];
        if (value === undefined || (value === '' && name !== 'DB_PASSWORD')) {
            problems.push(`${name} is missing`);
        } else if (value.startsWith('your-') || value.startsWith('replace-')) {
            problems.push(`${name} still has its placeholder value`);
        }
    }

    if (problems.length > 0) {
        console.error(
            `Server configuration error:\n  - ${problems.join('\n  - ')}\n\n` +
            'Copy server/.env.example to server/.env and fill it in.'
        );
        process.exit(1);
    }
};

module.exports = checkEnv;