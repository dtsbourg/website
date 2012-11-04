
function getProperty( property )
{
    return function( item )
    {
        return item[ property ];
    };
}

function sortBy( getter )
{
    if( typeof getter === 'string' )
    {
        getter = getProperty( getter );
    }

    var sorter = function( a, b )
    {
        return this.cmp( getter( a ), getter( b ) );
    };

    return {
        asc: sorter.bind( { cmp: asc } ),
        desc: sorter.bind( { cmp: desc } )
    };
}

function asc( a, b )  { return a - b; };
function desc( a, b ) { return b - a; };

module.exports = sortBy;
