function get_base_url( )
{
    return window.location.href.match( /http(?:s)?:\/\/(?:[^\/])+/ )[0];
}

function ajax_request( method, url, data, cb )
{
    var req = new XMLHttpRequest( );
    
    req.onreadystatechange = ( ) =>
        {
            if ( req.readyState == 4 && cb != null )
            {
                try
                {
                    let resp = JSON.parse( req.response );
                    cb( JSON.parse( req.response ) );
                }
                catch ( exception )
                {
                    cb( { } );
                }
            }
        };
    req.open( method, get_base_url( ) + url, true );
    req.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
    
    if ( data != null )
    {
        req.send( JSON.stringify( data ) );
    }
    else
    {
        req.send( );
    }
}

function api_all( cb )
{
    ajax_request( "get", "/api/all", null, cb );
}

function api_new( data, cb )
{
    ajax_request( "post", "/api/new", data, cb );
}

function api_update( id, data, cb )
{
    ajax_request( "put", "/api/" + id.toString( ) + "/update",
                  data, cb );
}

function api_delete( id, cb )
{
    ajax_request( "delete", "/api/" + id.toString( ) + "/delete", cb );
}
