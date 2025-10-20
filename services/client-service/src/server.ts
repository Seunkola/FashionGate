import app from "./app";
import "dotenv/config";

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Client Service is running on port  http://localhost:${PORT}`);
});
