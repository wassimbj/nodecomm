'use strict';
const Order = require('../../database/models/Order');
const Cart = require('../../database/models/Cart');
const Shipping = require('../../database/models/Shipping');

const braintree = require('braintree');
const gateway = require('../../lib/gateway');
const Controller = require('../../controllers/front/Controller');

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

        this.amount = 0;
        //  console.log(this)
    }
    // Cart empty middelware
    middlware(req, res, next)
    {
        super.cart_is_empty(req.session.userid, (empty) => {
            if(empty)
            {
                req.flash('warning', "You can't checkout, your cart is empty !");
                req.flash('msgType', 'warning')
                return res.redirect('/user/cart')
            }
            next()
        });
    }

    // Render the checkout view
    async index(req, res) {
        // console.log(this)
        await gateway.clientToken.generate({}, (err, response) => {
            var msgType = req.flash('msgType'),
                msg = req.flash(msgType);
            // Init the amount to pay
            Cart.find({ author: req.session.userid }, (err, cart) => {
                cart.map(item => {
                    this.amount = this.amount + item.total;
                });
            });
            return res.render('front.checkout', {
                clientToken: response.clientToken,
                msg, msgType
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
    async pay(req, res) {

        var transactionErrors;
        var nonce = req.body.payment_method_nonce;

        gateway.transaction.sale({
            amount: this.amount,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        }, (err, result) => {
            if (result.success || result.transaction) {
                const method = result.transaction.creditCard.cardType,
                    paid_at = result.transaction.createdAt;
                super.order_details(req.session.userid, (orders, total) => {
                   Shipping.findOne({ user: req.session.userid, used: 0 }).exec((err, ship) => {
                    //    ship_to = ship.id
                       Order.create({
                           customer: req.session.userid,
                           orders,
                           total,
                           paid: 1,
                           paid_at,
                           method,
                           ship_to: ship.id
                       }, (err, order) => {
                           if(order)
                           {
                               // Update cart to paid
                               order.orders.map(cart_id => {
                                   Cart.findOneAndUpdate({_id: cart_id}, { paid: 1 }, (err, paid_cart) => { console.log(err) })
                               });
                               // Update the shipping to used
                               Shipping.findOneAndUpdate({_id: order.ship_to}, { used: 1 }, (err, address) => { console.log(err) })
                           }
                           else { console.log('ERROR: ', err) }
                       });
                   })
                });

                return res.redirect('/user/checkout/success');
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