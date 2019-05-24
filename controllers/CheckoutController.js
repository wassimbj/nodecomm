'use strict';
const Order = require('../database/models/Order');
const braintree = require('braintree');
const gateway = require('../lib/gateway');
const Controller = require('../controllers/Controller');

class Checkout extends Controller{
    constructor()
    {
        super();
        this.TRANSACTION_SUCCESS_STATUSES = [
            braintree.Transaction.Status.Authorizing,
            braintree.Transaction.Status.Authorized,
            braintree.Transaction.Status.Settled,
            braintree.Transaction.Status.Settling,
            braintree.Transaction.Status.SettlementConfirmed,
            braintree.Transaction.Status.SettlementPending,
            braintree.Transaction.Status.SubmittedForSettlement
        ];
    }
    
    // Render the checkout view
    index(req, res) {
        gateway.clientToken.generate({}, function (err, response) {
            res.render('front.checkout', {
                clientToken: response.clientToken,
                msg: req.flash(req.flash('msgType')),
                msgType: req.flash('msgType')
            });
        });
    }

    // Payment errors
    formatErrors(errors) {
        var formattedErrors = '';

        for (var i in errors) { // eslint-disable-line no-inner-declarations, vars-on-top
            if (errors.hasOwnProperty(i)) {
                formattedErrors += 'Error: ' + errors[i].code + ': ' + errors[i].message + '\n';
            }
        }
        return formattedErrors;
    }

    // Create payment status, Error || Success
    createResultObject(transaction) {
        var result;
        var status = transaction.status;

        if (this.TRANSACTION_SUCCESS_STATUSES.indexOf(status) !== -1) {
            result = {
                header: 'Sweet Success!',
                icon: 'success',
                message: 'Your test transaction has been successfully processed. See the Braintree API response and try again.'
            };
        } else {
            result = {
                header: 'Transaction Failed',
                icon: 'fail',
                message: 'Your test transaction has a status of ' + status + '. See the Braintree API response and try again.'
            };
        }

        return result;
    }

    // Get the transaction
    transaction(req, res) {
        var result;
        var transactionId = req.params.id;

        gateway.transaction.find(transactionId, function (err, transaction) {
            result = this.createResultObject(transaction);
            // console.log(result)
            res.json({ transaction: transaction, result: result });
        });
    }

    // Make the payment/checkout
    pay(req, res) {
        var transactionErrors;
        var amount = 10; // In production you should not take amounts directly from clients
        var nonce = req.body.payment_method_nonce;

        gateway.transaction.sale({
            amount: amount,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        }, (err, result) => {
            if (result.success || result.transaction) {
                const method = result.transaction.creditCard.cardType,
                    paid_at = result.transaction.createdAt;
                super.order_details(req.session.userid, (orders, total, ship_to) => {
                    Order.create({
                        customer: req.session.userid,
                        orders,
                        total,
                        paid: 1,
                        paid_at,
                        method,
                        ship_to
                    });
                });
                req.flash('success', 'Your payment was successfully made !');
                req.flash('msgType', 'success')
                return res.redirect('/user/checkout/');
            } else {
                transactionErrors = result.errors.deepErrors();
                req.flash('danger', Checkout.prototype.formatErrors(transactionErrors));
                req.flash('msgType', 'danger')
                res.redirect('/user/checkout');
            }
        });
    }

}

module.exports = new Checkout();