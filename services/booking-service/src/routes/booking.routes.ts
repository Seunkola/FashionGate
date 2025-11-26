import { Router } from "express";
import { AuthMiddleware } from "@/middleware/auth";
import {
  createBooking,
  cancelBooking,
  getBookings,
  updateBookingDate,
  updateBookingStatus,
} from "@/controllers/booking.controller";

const router = Router();

router.post("/", AuthMiddleware, createBooking);
router.get("/", AuthMiddleware, getBookings);
router.put("/:booking_id/status", AuthMiddleware, updateBookingStatus);
router.put("/:booking_id/date", AuthMiddleware, updateBookingDate);
router.delete("/:booking_id", AuthMiddleware, cancelBooking);

export default router;
