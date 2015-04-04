var fs = require('fs');

module.exports = function(config) {
    var app = config.app;
    
    /*var index = function(req, res) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("X-Frame-Options", "Deny");
        
        res.sendfile('index.html', {root: config.path + '/static'});
    }

    app.get(config.url_base + '/', index);
    app.get(config.url_base + '/*', index);
*/      
}