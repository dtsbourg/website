
process.env.TZ = 'Europe/Zurich';

var http = require( 'http' ),
    url = require( 'url' ),
    request = require( 'request' ),
    express = require( 'express' ),
    feedparser = require( 'feedparser' ),
    MailChimpAPI = require( 'mailchimp' ).MailChimpAPI,
    config = require( './conf' ),
    FB = require( './lib/fb' ),
    Data = require( './lib/data' ),
    app = module.exports = express(),
    people = require( './lib/people' ),
    flick = require( 'flick' ),
    hook = flick(),
    reload = require( './lib/flick-handler' );

try {
    var mailchimp = new MailChimpAPI( config.MAILCHIMP.API_KEY, { secure: true } );
}
catch( e ) {
    console.error( '[ERROR] Can\'t connect to MailChimp', e.message );
}

var data = {};

function refreshData()
{
    FB.__connect( function( FB ) {
        accessToken = FB.getAccessToken();

        Data.fetchAll( FB, function( err, results ) {
            data.albums = results.albums;
            data.events = results.events;
        } );

        feedparser.parseUrl( config.RSS_FEED, function( err, meta, articles ) {
            data.news = articles;
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

app.locals.moment = require( 'moment' );

app.use( express.logger() );
app.use( express.compress() );
app.use( express.bodyParser() );

app.get( '/', function( req, res )
{
    res.render( 'home', {
        title: 'Home',
        events: data.events,
        news: data.news,
        page: 'home'
    } );
} );

app.get( '/events', function( req, res )
{
    res.render( 'events', {
        title: 'Events',
        events: data.events,
        page: 'events'
    } );
} );

app.get( '/events/:slug', function( req, res, next )
{
    var event = Data.Events.slugMap[ req.params.slug ];

    if( !event ) {
        return next();
    }

    res.render( 'event', {
        title: event.name,
        event: event,
        page: 'events',
        require: require
    } );
} );

app.get( '/people', function( req, res )
{
    res.render( 'people', {
        title: 'People',
        people: people,
        page: 'people',
        require: require
    } );
} );

app.get( '/partners', function( req, res )
{
    res.render( 'partners', {
        title: 'Partners',
        page: 'partners'
    } );
} );

app.get( '/gallery', function( req, res )
{
    res.render( 'gallery', {
        title: 'Gallery',
        albums: data.albums,
        page: 'gallery'
    } );
} );

app.get( '/album/:id', function( req, res )
{
    var id = req.params.id,
        album = data.albums.findById( id );

    if( !album ) {
        res.redirect( '/gallery' );
        return;
    }

    res.render( 'album', {
        title: album.name,
        album: album,
        page: 'gallery'
    } );
} );


app.post( '/subscribe', function( req, res )
{
    var email = req.body.email;

    if( !mailchimp ) {
        res.json( 500, { status: 'error', error: 'Mailing list server down.' } );
        return;
    }

    if( !email ) {
        res.json( 500, { status: 'error', error: 'No e-mail supplied.' } );
    }

    if( email && email.indexOf( '@' ) > 0 ) {
        // Send an error if MailChimp doesn't answer after 10 seconds.
        var timeout = setTimeout( function() {
            res.json( 500, { status: 'error', error: 'Mailing list server didn\'t respond.' } );

        }, 10 * 1000 );

        mailchimp.listSubscribe(
            {
                id: config.MAILCHIMP.LIST_ID,
                email_address: email,
                email_type: 'html',
                update_existing: true,
                // double_optin: '?'
                // send_welcome: '?'
            },
            function( err, response )
            {
                clearTimeout( timeout );

                if( err ) {
                    res.json( 500, { status: 'error', error: err.error } );
                }
                else {
                    res.json( 200, { status: 'subscribed', message: 'Thanks! Please check your e-mail.' } );
                }
            }
        );
    }
    else {
        res.json( 500, { status: 'error', error: 'Invalid e-mail address.' } );
    }
} );

app.use( express.static( __dirname + '/public' ) );

hook.use( 'HackEPFL/website', reload );
app.post( '/flick', flick.whitelist( { local: true } ) );
app.post( '/flick', flick.payload() );
app.post( '/flick', hook );
app.post( '/flick', function( req, res ) { res.end( 'Thanks, GitHub!' ); } );

app.use( function( req, res, next )
{
    res.status( 404 );

    if( req.accepts( 'html' ) ) {
        res.render( '404', {
            title: 'Page not found',
            page: '404',
            url: req.url
        } );
        return;
    }

    if( req.accepts( 'json' ) ) {
        res.send( { error: 'Page not found' } );
        return;
    }

    res.type( 'txt' ).send('Page not found' );
} );

if( !module.parent )
{
    var port = process.env.PORT || 3000;
    
    app.listen( port );
    console.log( 'Express app started on port ' + port );
}
