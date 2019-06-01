class AdminHome {
    
    index(req, res) {
        res.render('back.dashboard');
    }

}

module.exports = new AdminHome();