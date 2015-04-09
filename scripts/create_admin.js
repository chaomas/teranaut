var mongoose = require('../../agriserver/lib/mongo_connect');

var config = require('../../agriserver/lib/sysconfig')

var models = require("../server/models")({
    mongoose: mongoose,
});

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
    
    console.log('Complete. Closing connection')
    mongoose.connection.close(); 
});