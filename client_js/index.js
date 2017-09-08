var list_link = '<a href="#!" class="list-group-item list-group-item-action" id="';

var events = [];
var cur_event = -1;

function format_datetime( date )
{
    function pad( num )
    {
	if ( num < 10 )
	{
	    return '0' + num;
	}
	else
	{
	    return num;
	}
    }

    return date.getFullYear( ) + '-' +
	pad( date.getMonth( ) + 1 ) + '-' +
	pad( date.getDate( ) ) + 'T' +
	pad( date.getHours( ) ) + ':' +
	pad( date.getMinutes( ) ) + ':' +
        pad( date.getSeconds( ) );
}

function format_time( date )
{
    function pad( num )
    {
	if ( num < 10 )
	{
	    return '0' + num;
	}
	else
	{
	    return num;
	}
    }

    if ( date.getHours( ) > 12 )
    {
        return ( date.getHours( ) - 12 ).toString( ) + ":" + pad( date.getMinutes( ) ) + " PM";
    }
    else
    {
        var hour = date.getHours( );
        
        if ( hour == 0 )
        {
            hour = 12;
        }

        return date.getHours.toString( ) + ":" + pad( date.getMinutes( ) ) + " AM";
    }
}

function is_mobile( )
{
    return screen.width < 512;
}

/** Reload the event list and create the dom elements */

function reload_list( cb )
{
    api_all( function( data ) 
    {
        /* Clear and hide all list parents */
                 
        $( "#tasks_list_undefined" ).empty( );
        $( "#tasks_list_today" ).empty( );
        $( "#tasks_list_week" ).empty( );

        $( "#tasks_list_undefined_outer" ).hide( );
        $( "#tasks_list_today_outer" ).hide( );
        $( "#tasks_list_week_outer" ).hide( );
        
        events = [];
        var items = [];
        
        for ( var i=0; i < data.length; i++ )
        {
            events[data[i].id] = data[i];

            if ( data[i].due_date != null )
            {
                data[i].due_date = new Date( data[i].due_date );
            }

            if ( data[i].reserve_date != null )
            {
                data[i].reserve_date = new Date( data[i].reserve_date );
            }
            
            items.push( { title: data[i].title, date: data[i].due_date, id: data[i].id } );
            
            if ( data[i].reserve && data[i].reserve_date )
            {
                items.push( { title: "RSVP for \"" + data[i].title + "\"", date: data[i].reserve_date, id: data[i].id } );
            }
        }

        items.sort( function( a, b )
        {
	    var dateA = ( a && a.date ? a.date.valueOf( ) : 0 );
	    var dateB = ( b && b.date ? b.date.valueOf( ) : 0 );
	    
	    return dateA - dateB;
	} );

        var today = new Date( );
        
        for ( var i=0; i < items.length; i++ )
        {
            var parent = "#tasks_list_week";
            var show_time = false;

            if ( items[i].date &&
                 today.getMonth( ) == items[i].date.getMonth( ) &&
                 today.getYear( ) == items[i].date.getYear( ) &&
                 today.getDate( ) == items[i].date.getDate( ) )
            {
                parent = "#tasks_list_today";
                show_time = true;
            }
            else if ( items[i].date == null )
            {
                parent = "#tasks_list_undefined";
            }
	    else if ( items[i].date != null &&
                      items[i].date.getTime( ) < today.getTime( ) )
	    {
		parent = "#tasks_list_undefined";
		show_time = true;
	    }


            add_dom_event( items[i].title, items[i].date, items[i].id, parent, show_time );
        }

        if ( cb != null )
        {
            cb( );
        }
    } );
}

var dom = 0;

function add_dom_event( label, date, id, parent, show_time )
{
    var date_str = date ?
        ( show_time ? format_time( date ) : date.toLocaleDateString( ) ) : "";
    var icon = ( events[id].event_type == 0 ? "calendar" : "file-text" );
    var name = "task_" + id + "_" + ( dom++ ).toString( )
    
    if ( events[id].class_org &&
	 events[id].class_org.match( /cs/i ) )
    {
        icon = "file-code";
    }

    if ( label.match( /rsvp/i ) )
    {
        icon = "checklist";
    }

    $( parent + "_outer" ).show( );
    
    $( parent )
        .append( list_link + name + '"><div class="d-flex w-100 justify-content-between"><span><img src="icon/' + icon + '.svg"></img> ' + label + '</span><span>' + date_str + '</span></div></a>' )
    $( "#" + name )
        .click( function( event ) { select_item( id ); } );
}

function select_item( val )
{
    $( "[id^=task_]" ).removeClass( "active" );
    
    $( "#task_form_invalid_duedate" ).addClass( "hidden" );
    $( "#task_form_duedate" ).removeClass( "invalid" );

    $( "#task_form_invalid_reservedate" ).addClass( "hidden" );
    $( "#task_form_reservedate" ).removeClass( "invalid" );
    
    if ( cur_event != val && val != -1 )
    {
        $( "[id^=task_" + val + "]" ).addClass( "active" );

        cur_event = val;
        load_event_form( );

        if ( is_mobile( ) )
        {
            slide( 100 );
        }
        else
        {
            slide( 40 );
        }
    }
    else
    {
        cur_event = -1;
        slide( 0 );
    }
}

/* Load data from the currently picked event into the form */

function load_event_form( )
{
    if ( cur_event != -1 )
    {
        var event = events[cur_event];

        $( "#task_form_type" ).val( event.event_type );
        $( "#task_form_title" ).val( event.title );
        $( "#task_form_classorg" ).val( event.class_org );
        $( "#task_form_location" ).val( event.location );
        
        if ( event.due_date )
        {
	    $( "#task_form_duedate" ).val( format_datetime( event.due_date ) );
        }
        else
        {
            $( "#task_form_duedate" ).val( "" );
        }
        
        $( "#task_form_reserve" ).prop( "checked", ( event.reserve == "true" || event.reserve === true ) );

        if ( event.reserve_date )
        {
	    $( "#task_form_reservedate" ).val( format_datetime( event.reserve_date ) );
        }
        else
        {
            $( "#task_form_reservedate" ).val( "" );
        }
        
        $( "#task_form_reservenotes" ).val( event.reserve_notes );
        $( "#task_form_notes" ).val( event.notes );

        event_form_update_layout( );
    }
}

function event_form_update_layout( )
{
    switch ( $( "#task_form_type" ).val( ) )
    {
        case "0": /* Event */
        $( "#task_form_section_reserve" ).show( );
        $( "#task_form_label_duedate" ).html( "Date" );
        
        break;
        case "1": /* Task */
        $( "#task_form_section_reserve" ).hide( );
        $( "#task_form_label_duedate" ).html( "Due Date" );
        
        break;
    }
}

/* Save data from the current event form to the server */

function save_event_form( cb )
{
    if ( cur_event != -1 )
    {
        $( "#task_form_update_btn" ).addClass( "disabled" );
        
        var due_date = $( "#task_form_duedate" ).val( )
        var reserve_date = $( "#task_form_reservedate" ).val( );
        var valid_dates = true;
        
        if ( due_date.length > 0 &&
             isNaN( Date.parse( due_date ) ) )
        {
            valid_dates = false;
            
            $( "#task_form_duedate" ).addClass( "invalid" );
            $( "#task_form_invalid_duedate" ).removeClass( "hidden" );
        }

        if ( reserve_date.length > 0 &&
             isNaN( Date.parse( due_date ) ) )
        {
            valid_dates = false;

            $( "#task_form_reservedate" ).addClass( "invalid" );
            $( "#task_form_invalid_reservedate" ).removeClass( "hidden" );
        }

        if ( valid_dates )
        {
            var event = { };

            event.event_type = $( "#task_form_type" ).val( );
            event.title = $( "#task_form_title" ).val( );
            event.class_org = $( "#task_form_classorg" ).val( );
            event.location = $( "#task_form_location" ).val( );
            event.due_date = $( "#task_form_duedate" ).val( );
            event.reserve = $( "#task_form_reserve" ).is( ':checked' );
            event.reserve_date = $( "#task_form_reservedate" ).val( );
            event.reserve_notes = $( "#task_form_reservenotes" ).val( );
            event.notes = $( "#task_form_notes" ).val( );

            api_update( cur_event, event, function( data )
            {
                $( "#task_form_update_btn" )
                    .removeClass( "disabled" );
                
                cb( data );
            } );
        }
        else
        {
            $( "#task_form_update_btn" )
                .removeClass( "disabled" );
        }
    }
}

/* Create a new task/event with a title */

function send_new_task( )
{
    var data = { title: $( "#tasks_new" ).val( ) };

    api_new( data, function( data )
    {
        $( "#tasks_new" )[0].value = "";
        reload_list( function( ){ select_item( data.id ); } );
    } );
}

function slide( percent )
{
    if ( !is_mobile( ) )
    {
        $( "#top" ).css( "width", ( 100 - percent ).toString( ) + '%' )
    }
    
    $( "#slide" ).css( "width", percent.toString( ) + '%' )
}

$( document ).ready( function( )
{
    reload_list( );
    $( "#tasks_new" ).on( 'keypress', function( e )
    {
        if ( e.which == 13 ){ send_new_task( ); }
    } );

    $( "#task_form_type" ).change( event_form_update_layout );
    
    $( "#task_form_update_btn" ).click( function( )
    {        
        save_event_form( function( data )
        {
            reload_list( );
            select_item( -1 );
        });
    } );

    $( "#task_form_delete_btn" ).click( function( )
    {
        api_delete( cur_event, function( )
        {
            reload_list( );
            select_item( -1 );
        } );
    } );

    $( "#task_form_back_btn" ).click( function( ){ select_item( -1 ); } );

    api_version( function( data ){ $( "#version" ).html( "Git version: " + data.git_small ); } );
} );
