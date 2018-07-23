// get gravatar icon from email
var gravatar = require('gravatar');
// get reviews model
var Reviews = require('../models/reviews');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

//List Reviews
exports.show = function (req, res){
    //List all reviews and sort by Date
    sequelize.query('select r.id, r.name, r.satisfaction, r.content, l.id AS [listing_id] from Reviews r join Listings l on r.listing_id = l.id', 
    {model: Reviews}).then((reviews) => {
        res.render('reviews', {
            title: 'Review Page',
            reviews: reviews,
            gravatar: gravatar.url(reviews.user_id, { s: '80', r: 'x', d: 'retro'}, true),
            urlPath: req.protocol + "://" + req.get("host") + req.url
        })
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
};

//Create Review
exports.create = function (req, res) {
    console.log("creating reviews")
    var reviewData = {
        listing_id: req.body.listing_id,
        name: req.body.name,
        satisfaction: req.body.satisfaction,
        content: req.body.content,
    }

    Reviews.create(reviewData).then((newReview, created) => {
        if (!newReview) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect('/listing');
    })
};

// exports.delete = function (req, res) {
//     var record_num = req.params.reviews_id;
//     console.log("deleting reviews " + record_num);
//     Reviews.destroy({where: {id: record_num}}).then((deletedReview) => {
//         if(!deletedReview){
//             return res.send(400, {
//                 message: "error"
//             });
//         }
//         res.status(200).send({message: "Deleted reviews :" + record_num});
//     })
// }

//Comments authorization middleware
exports.hasAuthorization = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};