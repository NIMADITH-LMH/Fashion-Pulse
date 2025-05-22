const reservationModel = require("../../models/reservationModel")
const getReservationDetails = async (req, res) => {
    try {
        const reservations = await reservationModel.aggregate([
            {
                $group: {
                    _id: "$ValidateReservation",  
                    count: { $sum: 1 },  // Count each status occurrence
                }
            }
        ]);
        

        res.json({
            message: "Reservation details by status",
            error: false,
            success: true,
            data: reservations
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
};
 
module.exports = getReservationDetails;
