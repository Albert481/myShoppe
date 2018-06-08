// models/chatMsg.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

// This needs to have a foreign key linked to the users so that user knows who sent the message
const ChatMsg = sequelize.define('ChatMsg', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        trim: true
    },
    timestamp: {
        type: Sequelize.TIME,
        allowNull: true,
    }
});

// force: true will drop the table if it already exists
ChatMsg.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("ChatMsgs table synced");
    return ChatMsg.upsert({
        id: 1,
        name: 'Albert',
        message: 'Hello World',
        timestamp: '12:04'
    }) 
});

module.exports = sequelize.model('ChatMsg', ChatMsg);