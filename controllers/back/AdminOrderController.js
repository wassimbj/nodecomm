const Controller = require('../Controller');
const mongoose = require('mongoose')
const OrderModel = require('../../database/models/Order');
const fs = require('fs');
const pdf = require('html-pdf')
const edge = require('edge.js')
const path = require('path')


class Order extends Controller{

    constructor()
    {
        super();
        this.order_details = [];
        edge.registerViews(path.join(__dirname, '../../views'))
    }

    // See All orders
    index(req, res) {
        super.get_orders((orders) => {
            res.render('back.orders', { orders });
        })
    }
    
    // Single detailed order
    details(req, res)
    {
        const id = req.params.id;
        super.get_single_order(id, (order) => {
            // console.log(order[0])
            this.order_details = order[0];
            res.render('back.order_details', { order: order[0]})
        })

    }

    // Change the order status
    changeStatus(req, res)
    {
        const id = mongoose.Types.ObjectId(req.body.id);
        OrderModel.findOneAndUpdate({ _id: id }, { delivered: req.body.status }, (err, data) => {
            if (err)
                res.json(err)
            else
                res.json(data)
        });
    }

    // Print invoice ( Not finished yet !!)
    printInvoice(req, res)
    {
        // console.log(this.order_details);
        let inv = edge.render('templates.invoice.edge', {order: this.order_details});
        let inv_file_name = req.params.id.toString().substring(15, 19)
        // var html = fs.readFileSync(inv, 'utf8');
        var options = { format: 'Letter' };

        pdf.create(inv, options).toFile(path.join(__dirname, '../../invoices', `invoice_${inv_file_name}.pdf`),
        (err, file) => {
            if (err) return console.log(err);
            // Open file in the browser
            fs.readFile(file.filename, (err, data) => {
               if(err)
                    return res.redirect('back')
               else{
                   res.contentType("application/pdf");
                   return res.send(data);
               }
            });
        });
    }

    // Send invoice par email ( Not finished yet !! )
    sendInvoice(req, res) {
        let userid = req.params.userid,
            { subject, content, user_email } = req.body;

        super.sendmail(user_email, subject, content, (result) => {
            console.log(result)
            if (result) {
                req.flash('msgType', 'success');
                req.flash('success', `Your email was successfully sent to ${user_email}`)
            } else {
                req.flash('msgType', 'danger');
                req.flash('danger', `Whoops ! something went wrong, please try again...`)
            }
            res.redirect('back')
        })

    }

}

module.exports = new Order();