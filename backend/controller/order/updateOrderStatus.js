const orderModel = require("../../models/orderModel");

const updateReservationStatus = async (req, res) => {
    const { orderID, status } = req.body;

    if (!orderID || !status) {
        return res.status(400).json({
            message: "ReservationID and status are required.",
            error: true,
            success: false
        });
    }

    try {
        const reservation = await orderModel.findOneAndUpdate(
            { _id: orderID },
            { Status: status },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found",
                error: true,
                success: false
            });
        }

        res.json({
            message: "Order status updated successfully",
            error: false,
            success: true,
            data: reservation
        });

    } catch (err) {
        res.status(500).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
};

module.exports = updateReservationStatus;
