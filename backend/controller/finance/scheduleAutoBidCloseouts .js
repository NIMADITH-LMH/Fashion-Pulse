const cron = require('node-cron');
const { scheduleAutoBidCloseouts } = require('../finance/bidIncomeController');

// Run every hour
cron.schedule('0 * * * *', scheduleAutoBidCloseouts);