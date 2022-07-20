export const authorizer = {
    handler: `${__dirname
        .split(process.cwd())[1]
        .substring(1)
        .replace(/\\/g, '/')}/handler.handler`,
};
