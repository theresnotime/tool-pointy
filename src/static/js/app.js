/*jshint esversion: 6 */
$( function() {
    let socket = io();
    let sessionId = getSessionId();
    let path = document.location.pathname;

    debug( 'app', 'ready', 'Document ready' );
    
    socket.on( 'connect', function() {
        socket.emit(
            'client.connected',
            {
                session: sessionId,
                action: 'connect',
                path: path
            }
        );
        debug( 'ws', 'emit', 'client.connected' );
    });

    if( $( '#start_pointing' ).length > 0 ) {
        $( '#start_pointing' ).click( function () {
            let pointing_id = parsePhabUrl( $( '#pointing_id' ).val() );
            if( pointing_id ) {
                debug( 'app', 'start_pointing', pointing_id );
                socket.emit(
                    'client.start_pointing',
                    {
                        session: sessionId,
                        action: 'start_pointing',
                        path: path,
                        pointing_id: pointing_id
                    }
                );
                debug( 'ws', 'emit', 'client.start_pointing' );
                window.location.href = encodeURI('/pointing/' + pointing_id);
            } else {
                console.debug( 'Clicked. Val empty' );
                //TODO: show error
            }
        });
    }

    /**
     * Verify and return a Phabricator task ID
     * 
     * @param {string} id Possible phabricator task ID
     * @returns {string} Phabricator task ID
     */
    function parsePhabUrl(id) {
        const re = /T\d+/gm;
        const found = id.match(re);
        if( found !== null ) {
            return found[0];
        } else {
            return id;
        }
    }

    /**
     * Show debug message
     * 
     * @param {string} topic 
     * @param {string} action 
     * @param {string} message 
     */
    function debug( topic, action, message ) {
        console.debug( '[' + topic + '] [' + sessionId + ' @ ' + path + ']: ' + action + ': ' + message );
    }

    /**
     * Generate a random session ID
     * 
     * @returns {string} Session ID
     */
    function generateSessionId() {
        return btoa( Math.random().toString( 36 ) );
    }

    /**
     * Get session ID from cookie
     * 
     * @returns {string} Session ID
     */
    function getSessionId() {
        let sessionId = Cookies.get( 'pointy_session' );
        if ( sessionId === undefined ) {
            sessionId = generateSessionId();
            Cookies.set(
                'pointy_session',
                sessionId,
                {
                    sameSite: 'strict'
                }
            );
        }
        return sessionId;
    }
});
