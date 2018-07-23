var offerPrice = require('../models/offerPrice');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

// Add an offer record top database
exports.insert = function (req, res) {
    var offerData = {
        user_id: req.user.user_id,
        listing_id: req.body.listing_id,
        offerprice: req.body.offerprice
    }
    offerPrice.create(offerData).then((newRecord, created) => {
        if (!newRecord) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect('/');
    })
};

// List all the offer records in database
exports.list = function (req, res) {
    sequelize.query('SELECT o.id, listing_id, l.name AS name, offerprice FROM OfferPrices o INNER JOIN Listings l ON o.listing_id = l.id', { model: offerPrice, raw: true}).then((offer) => {
        
        res.render('manageOffers', {
            title: "Manage Offers",
            itemList: offer,
            urlPath: req.protocol + "://" + req.get("host") + req.url
        })
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
};

// List one specific offer record from database
exports.manageOffers = function (req, res) {
    var record_num = req.params.id;
    offerPrice.findById(record_num).then(function (offerRecord) {
        res.render('manageOffers', {
            title: "Manage Offer",
            item: offerRecord,
            hostPath: req.protocol + "://" + req.get("host")
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
};

// List one specific offer record from database
exports.editOffer = function (req, res) {
    var record_num = req.params.id;
    offerPrice.findById(record_num).then(function (offerRecord) {
        res.render('editOffers', {
            title: "Edit Offer",
            item: offerRecord,
            hostPath: req.protocol + "://" + req.get("host")
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
};

//Update offer record in database
exports.update = function (req, res) {
    var record_num = req.params.id;
    var updateData = {
        id: req.body.id,
        listing: req.body.listing,
        offerprice: req.body.offerprice
    }
    offerPrice.update(updateData, { where: { id: record_num } }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord == 0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.status(200).send({ message: "Updated offer record:" + record_num });
    })
}

//Delete an offer from database
exports.delete = function (req, res) {
    var record_num = req.params.id;
    console.log("deleting" + record_num);
    offerPrice.destroy({ where: { id: record_num } }).then((deletedRecord) => {
        if(!deletedRecord) {
            return res.send(400, {
                message: "error"
            });
        }
        res.status(200).send({ message: "Deleted offer record:" + record_num});
    });
}