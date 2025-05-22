const resrvationModel = require("../../models/reservationModel")


async function addReservationController(req, res){
    try {
        const sessionUserId = req.userId;
        const addReservation = new resrvationModel(req.body);
        const saveReservation = await addReservation.save();
        res.status(201).json({
            message: "Reservation added successfully",
            error: false,
            success: true,
            data: saveReservation
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = addReservationController;