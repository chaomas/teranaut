var mongoose = require('../../lib/mongo_connect');

var config = require('../../lib/sysconfig')

var models = require("../../models")

var password = process.argv[2];

user = new models.User({
    client_id: 0,
    role: 'admin',
    firstname: 'System',
    lastname: 'Admin',    
    username: 'admin',
    hash: password
})

user.save(function(err, account) {
    if (err) {
        console.log('Failure creating account ' + err)        
    }
    
    mongoose.connection.close(); 
});