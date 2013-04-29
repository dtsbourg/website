
var shell = require( 'shelljs' );

function gitPull( root, options )
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

module.exports = function( req, res, done )
{
  var root = '/var/www/hackersatepfl.com';

  gitPull( root, { rebase: true } )( req, res, next );

  function next( req, res ) {
    shell.exec( 'npm install' );
    shell.exec( 'compass compile -e production --force public/' );
    done();
  }
};
