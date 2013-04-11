
var crypto = require( 'crypto' ),
    slug = require( 'slug' );

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
    },

    slug: function( str )
    {
        return slug( str + '' ).toLowerCase();
    },

    nl2br: function( str )
    {
        // http://phpjs.org/functions/nl2br/
        return ( str + '' ).replace( /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2' );
    },

    autolink: function( str )
    {
        var regex = /(^|\s)(\b(https?|ftp):\/\/[\-A-Z0-9+\u0026@#\/%?=~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~_|])/gi;
        return ( str + '' ).replace( regex, '$1<a href="$2">$2</a>' );
    },

    nop: function() {}
    
};