var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;

if ( !process.env.MONGODB_URI ) {
    throw new Error( 'Error: MONGODB_URI is not set. Did you run source env.sh ?' );
    process.exit(1);
    return;
}
mongoose.connect( process.env.MONGODB_URI );
mongoose.Promise = global.Promise;

var UserSchema = Schema({
    username: String,
    password: String,
    status: Mixed
});

module.exports = {
    User
};
