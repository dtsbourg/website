
var http = require( 'http' ),
    url = require( 'url' ),
    request = require( 'request' ),
    FB = require( './lib/fb' ),
    fetchData = require( './lib/data' ).fetchAll,
    express = require( 'express' ),
    app = module.exports = express(),
    data = {},
    people = require( './lib/people' );

function refreshData()
{
    FB.__connect( function( FB )
    {
        accessToken = FB.getAccessToken();

        fetchData( FB, function( err, results )
        {
            data.albums = results.albums;
            data.events = results.events;
        } );
    } );

    setTimeout( refreshData, 60 * 15 * 100 );
}

refreshData();

app.enable( 'trust proxy' );

app.set( 'views', __dirname + '/views' );
app.engine( 'ejs', require( 'ejs-locals' ) );
app.locals._layoutFile = '/layout.ejs';
app.set( 'view engine', 'ejs' );

app.use( express.bodyParser() );

app.get( '/', function( req, res )
{
    res.render( 'home', {
        title: 'Home',
        events: data.events
    } );
} );

app.get( '/events', function( req, res )
{
    res.render( 'events', {
        title: 'Events',
        events: data.events
    } );
} );

app.get( '/people', function( req, res )
{
    res.render( 'people', {
        title: 'People',
        people: people
    } );
} );

app.get( '/gallery', function( req, res )
{
    res.render( 'gallery', {
        title: 'Gallery',
        albums: data.albums
    } );
} );

app.get( '/album/:id', function( req, res )
{
    var id = req.params.id,
        album = data.albums.findById( id );

    if( !album )
    {
        res.redirect( '/gallery' );
        return;
    }

    res.render( 'album', {
        title: album.name,
        album: album
    } );
} );


app.post( '/subscribe', function( req, res )
{
    var email = req.body.email;

    if( email && email.indexOf( '@' ) > 0 )
    {
        // TODO: add e-mail to mailing list.

        res.json( 200, { status: 'subscribed' } );
    }
    else
    {
        res.json( 500, { status: 'error', error: 'Invalid e-mail address.' } );
    }
} );

app.use( express.static( __dirname + '/public' ) );

if( !module.parent )
{
    var port = process.env.PORT || 3000;
    
    app.listen( port );
    console.log( 'Express app started on port ' + port );
}
