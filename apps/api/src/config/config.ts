export default () => ({
  database: {
    connectionString:
      process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation-project',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});
