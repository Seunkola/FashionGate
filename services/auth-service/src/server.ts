 import app from './app';
 import "dotenv/config";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Auth service running on port http://localhost:${PORT}`);
});
