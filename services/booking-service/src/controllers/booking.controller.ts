import { Request, Response } from "express";
import { prisma } from "@/services/prismaClient";
import { supabase } from "@/services/supabaseClient";

// book a designer or tailor appointment and prevent double bookings with concurrency control
export async function createBooking(req: Request, res: Response) {
  try {
    const userID = (req as any).user.id;
    const { service_id, start_date } = req.body;

    // check if required params are not null
    if (!service_id)
      return res.error("BAD_REQUEST", "Service ID is required!", 400);
    if (!start_date)
      return res.error("BAD_REQUEST", "Start date is required!", 400);

    // check if service exists
    const service = await prisma.service.findUnique({
      where: { id: service_id },
    });

    if (!service) return res.error("NOT_FOUND", "Service does not exist!", 404);

    /* create booking in DB */

    // calculate end date based on service duration
    const startDate = new Date(start_date);
    const endDate = new Date(
      startDate.getTime() + service.duration_days * 24 * 60 * 60 * 1000
    );

    // create new booking in DB
    const newBooking = await prisma.booking.create({
      data: {
        client_id: userID,
        service_id: service_id,
        start_date: startDate,
        end_date: endDate,
        booking_status: "pending",
        payment_status: "unpaid",
      },
    });

    return res.success(newBooking, "Booking created Successfully");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

// *cancel bookings and send notifications to users and service providers
export async function cancelBooking(req: Request, res: Response) {
  try {
    const userID = (req as any).user.id;
    const { booking_id } = req.params;

    // check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
    });

    if (!booking) return res.error("NOT_FOUND", "Booking does not exist!", 404);

    // check if the user is authorized to cancel the booking
    if (booking.client_id !== userID)
      return res.error(
        "FORBIDDEN",
        "You are not authorized to cancel this booking!",
        403
      );

    // update booking status to cancelled
    const cancelledBooking = await prisma.booking.update({
      where: { id: booking_id },
      data: { booking_status: "cancelled" },
    });

    return res.success(cancelledBooking, "Booking cancelled Successfully");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

// *retrieve bookings with filtering options (date, status, user)
export async function getBookings(req: Request, res: Response) {
  try {
    const userID = (req as any).user.id;
    const { status, start_date, end_date } = req.query;
    const filters: any = { client_id: userID };

    if (status) filters.booking_status = status;
    if (start_date)
      filters.start_date = { gte: new Date(start_date as string) };
    if (end_date) filters.end_date = { lte: new Date(end_date as string) };

    const bookings = await prisma.booking.findMany({
      where: filters,
      include: { service: true },
    });
    return res.success(bookings, "Bookings retrieved Successfully");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

// *update booking details and manage booking and payment status (confirmed, completed, cancelled)
export async function updateBookingStatus(req: Request, res: Response) {
  try {
    const userID = (req as any).user.id;
    const { booking_id } = req.params;
    const { booking_status, payment_status } = req.body;

    // check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
    });

    if (!booking) return res.error("NOT_FOUND", "Booking does not exist!", 404);

    // check if the user is authorized to update the booking
    if (booking.client_id !== userID)
      return res.error(
        "FORBIDDEN",
        "You are not authorized to update this booking!",
        403
      );

    // update booking details
    const updatedBooking = await prisma.booking.update({
      where: { id: booking_id },
      data: {
        booking_status: booking_status || booking.booking_status,
        payment_status: payment_status || booking.payment_status,
      },
    });

    return res.success(updatedBooking, "Booking Status updated Successfully");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

// *update booking date
export async function updateBookingDate(req: Request, res: Response) {
  try {
    const userID = (req as any).user.id;
    const { booking_id } = req.params;
    const { start_date } = req.body;

    // check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
    });

    if (!booking) return res.error("NOT_FOUND", "Booking does not exist!", 404);

    // check if the user is authorized to update the booking
    if (booking.client_id !== userID)
      return res.error(
        "FORBIDDEN",
        "You are not authorized to update this booking!",
        403
      );

    // calculate new end date based on service duration
    const service = await prisma.service.findUnique({
      where: { id: booking.service_id! },
    });

    const newStartDate = new Date(start_date);
    const newEndDate = new Date(
      newStartDate.getTime() +
        (service?.duration_days || 0) * 24 * 60 * 60 * 1000
    );

    // update booking dates
    const updatedBooking = await prisma.booking.update({
      where: { id: booking_id },
      data: {
        start_date: newStartDate,
        end_date: newEndDate,
      },
    });
    return res.success(updatedBooking, "Booking Date updated Successfully");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}
