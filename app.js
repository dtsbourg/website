
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

    console.log( album.photos );

    res.render( 'album', {
        title: album.name,
        album: album
    } );
} );

// I'm lazy. Will eventually^Wdefinitely have to switch to proper resources linking.
// Eg. https://graph.facebook.com/43543534254353/picture?type=large => http://photos-d.ak.fbcdn.net/[...]
app.get( '/fb/*', function( req, res )
{
    var uri = url.parse( req.url.replace( /^\/fb/, '' ), true );
    uri.protocol = 'https:';
    uri.host = 'graph.facebook.com';
    uri.query.access_token = FB.getAccessToken();
    uri.search = undefined;
    uri = url.format( uri );

    request( uri ).pipe( res );
} );

app.use( express.static( __dirname + '/public' ) );

if( !module.parent )
{
    var port = process.env.PORT || 3000;
    
    app.listen( port );
    console.log( 'Express app started on port ' + port );
}
