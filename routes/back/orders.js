const express = require('express');
const router = express.Router();
const AdminOrderController = require('../../controllers/back/AdminOrderController');

//  Prefixed route: /admin/orders
// Orders homepage
router.get('/', AdminOrderController.index);

// detailed order
router.get('/:id', AdminOrderController.details.bind(AdminOrderController))

// Change order status
router.post('/status', AdminOrderController.changeStatus);

// Print invoice (Not finished yet !)
router.get('/:id/print', AdminOrderController.printInvoice.bind(AdminOrderController))

// Send invoice (Not finished yet !)
router.post('/:userid/sendmail', AdminOrderController.sendInvoice.bind(AdminOrderController))

module.exports = router;