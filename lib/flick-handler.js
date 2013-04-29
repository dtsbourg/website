
var shell = require( 'shelljs' );

exports.pull = function gitPull( root, options )
{
    return function( req, res, next ) {
        var cmd = 'git pull' + ( options.rebase ? ' --rebase' : '' );

        shell.cd( root );
        shell.exec( cmd, function( code, output ) {
            console.log( cmd + ' exited with code ' + code );
        } );

        next();
    };
};