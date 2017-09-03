var express = require( "express" ),
    Sequelize = require( "sequelize" ),
    bodyParser = require( "body-parser" );
var app = express( ),
    port = process.env.PORT || 3000,
    router = express.Router( );

const base_url = "/list";

const sequelize = new Sequelize( "blunderlist-dev", null, null, { host: "localhost", dialect: "sqlite", storage: "db.sqlite" } );
const Event = sequelize.define( 'event',
{
    event_type: { allowNull: false, defaultValue: 0, type: Sequelize.INTEGER },
    title: { allowNull: false, type: Sequelize.STRING },
    class_org: { type: Sequelize.STRING },
    location: { type: Sequelize.STRING },
    due_date: { type: Sequelize.DATE },
    reserve: { defaultValue: false, type: Sequelize.BOOLEAN },
    reserve_date: { type: Sequelize.DATE },
    reserve_notes: { type: Sequelize.TEXT },
    notes: { type: Sequelize.TEXT }
} );

router.use( bodyParser.urlencoded( { extended: true } ) );
router.use( bodyParser.json( ) );

router.use( express.static( "public" ) );

router.get( "/api/all", ( req, res ) =>
{
    Event.findAll( ).then( ( events ) => { res.json( events ); } );
} );

router.post( "/api/new", ( req, res ) =>
{
    Event.create( req.body ).then( ( event ) =>
    {
        res.json( event );
    } );
} );

router.put( "/api/:id/update", ( req, res ) =>
{
    Event.update( req.body, { where: { id: req.params.id } } )
        .then( ( event ) =>
        {
            res.json( event );
        } );
} );

router.delete( "/api/:id/delete", ( req, res ) =>
{
    Event.destroy( { where: { id: req.params.id } } )
        .then( ( event ) =>
        {
            res.json( event );
        } );
} );

Event.sync( { } )
    .then( ( ) =>
    {
	app.use( base_url, router );
        app.listen( port );
    } );
