'use strict';
const Order = require('../../database/models/Order');
const Cart = require('../../database/models/Cart');
const Shipping = require('../../database/models/Shipping');

// const path = require('path')
const mongoose = require('mongoose')
const braintree = require('braintree');
const gateway = require('../../lib/gateway');
const Controller = require('../Controller');

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
    async middlware(req, res, next)
    {
        await super.cart_is_empty(req.session.userid, (empty) => {
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
    /***
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
    // Route: /user/checkout/:transaction_id
    async transaction(req, res) {
            var result;
            var transactionId = req.params.id;

            await gateway.transaction.find(transactionId, function (err, transaction) {
                    result = this.createResultObject(transaction);
                    // console.log(result)
                    res.json({ transaction: transaction, result: result });
            });
    }
    **/


    // render order success/confirmation page
    confirmation(req, res)
    {
        const order_id = req.flash('order_id');
        // console.log('ORDER ID: ', order_id)
        super.get_single_order(order_id[0], (order) => {
            if(order.length > 0)
            {

                // // send confirmation email to the user
                let user = order[0].customer[0],
                    content = `
                    <div style='max-width:600px;margin:0 auto;font-size:16px;line-height:24px'>
                        <b> Hey ${user.firstname+" "+user.lastname} </b>
                         <br>
                        <p> Your order was successfully made !</p>
                        <p> We are so happy that you choosed nodeComm as your shopping place ! </p>
                        <p>
                            You can learn more about your orde in your profile !
                        </p>
                    </div>
                    `;
                super.sendmail(user.email, 'Order confirmation !', content, (result) => {
                    console.log(result)
                })
                // display view
                return res.render('front.confirmation', { order: order[0] })
            }else{
                return res.redirect('/user/cart')
            }
        })
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
            if (!err && (result.success || result.transaction)) {
                const method = result.transaction.creditCard.cardType,
                    paid_at = result.transaction.createdAt;
                super.order_details(req.session.userid, (orders, total) => {
                   Shipping.findOne({ user: req.session.userid, used: 0 }).exec((err, ship) => {
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
                                   Cart.findOneAndUpdate({_id: cart_id}, { paid: 1 }).exec()
                               });
                               // Update the shipping to used
                               Shipping.findOneAndUpdate({_id: order.ship_to}, { used: 1 }).exec()
                              
                            // console.log('ORDER CREATED: ', order);
                            req.flash('order_id', order._id)
                            return res.redirect('/user/checkout/success');

                           }else {
                               console.log('ERROR: ', err)
                           }
                       });
                   })
                });
                // req.flash()

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