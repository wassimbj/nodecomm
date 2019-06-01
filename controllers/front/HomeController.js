class Home {
    index(req, res){
        res.render('front.index');
    }

}

module.exports = new Home();