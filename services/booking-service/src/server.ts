import app from "./app";
import dotenv from "dotenv";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Booking service running on port http://localhost:${PORT}`);
});
