
var crypto = require( 'crypto' );

function hash( str, algorithm )
{
    var hash = crypto.createHash( algorithm );
    
    hash.update( str );

    return hash.digest( 'hex' );
}

module.exports = {
    
    hash: hash,

    md5: function( str )
    {
        return hash( str, 'md5' );
    },

    sha1: function( str )
    {
        return hash( str, 'sha1' );
    }
    
};