// Particle effects for Empathy bot's visual
particlesJS('particles-js', {
    "particles": {
        "number": {
            "value": 3500,
            "density": {
                "enable": false,
                "value_area": 481.0236182596568
            }
        },
        "color": {
            "value": "#CCC"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            }
        },
        "size": {
            "value": 0.2,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            // "distance": 50,
            "distance": 20.10236182596568,
            "color": "#ffffff",
            "opacity": .7,
            "width": 2
        },
        "move": {
            "enable": true,
            "speed": 10,
            "direction": "none",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
        "onhover": {
            "enable": true,
            "mode": "repulse"
        },
        "onclick": {
            "enable": true,
            "mode": "push"
        },
        "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 60,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 1
            },
            "remove": {
                "particles_nb": 6
            }
        }
    },
    "retina_detect": true
});

$( 'document' ).ready( function() {
    // Client side Socket connection
    // Server side Socket event handlers are in /server/socket.js
    var url = $( location ).attr( 'host' );
    var socket = io.connect( url );

    var particleConfig = {
        x: window.pJSDom[0].pJS.canvas.w / 2,
        y: window.pJSDom[0].pJS.canvas.h / 2,
        sx:20,
        sy:20
    };

    const api = pJSDom[0].pJS.fn.modes

    var videoInput = document.getElementById('video');
    var ctracker = new clm.tracker();

    ctracker.init();
    ctracker.start( videoInput );

    function gumSuccess( stream ) {
        if ("srcObject" in videoInput) {
            videoInput.srcObject = stream;
        }
        else {
            videoInput.src = (window.URL && window.URL.createObjectURL(stream));
        }

        videoInput.onloadedmetadata = function() {
            videoInput.play();
            setTimeout(positionLoop, 1000)
        }
    }

    function gumFail () {

    }

    if( navigator.mediaDevices )        navigator.mediaDevices.getUserMedia({ video : true }).then( gumSuccess ).catch( gumFail );
    else if( navigator.getUserMedia )   navigator.getUserMedia({ video : true }, gumSuccess, gumFail );
    else                                console.log("Your browser does not seem to support getUserMedia, using a fallback video instead.");

    function scale( positions, ix, scaleAmt ) {
        const cx = particleConfig.x;
        const cy = particleConfig.y;

        const w = ( positions[13][0] - positions[1][0] ) / 2
        const h = ( positions[13][1] - positions[1][1] ) / 2

        const xs = particleConfig.sx;
        const xy = particleConfig.sy;
        // const xs = 10//cx / w
        // const xy = 10//cy / h

        const x = ( ( positions[ix][0] - positions[62][0] ) * xs ) + cx
        const y = ( ( positions[ix][1] - positions[62][1] ) * xy ) + cy

        return { x, y };
    }

    function positionLoop() {
        //requestAnimFrame(positionLoop);
        var positions = ctracker.getCurrentPosition();
        // do something with the positions ...
        // print the positions
        var positionString = "";
        //console.log(positions)

        if( positions ) {
            const pJS = pJSDom[0].pJS
            pJS.particles.array.splice(pJS.particles.array.length - positions.length, positions.length);
            for (var p = 0;p < positions.length;p++) {
                let pt = scale( positions, p, 10 );
                api.pushParticles(1, {pos_x: pt.x, pos_y: pt.y})
                // console.log(pt);
            }
        }
    }

    setInterval( positionLoop, 100 );
    // setInterval(api.removeParicles(200), 100);

    // Modal
    var modal = document.getElementById('myModal');
    var btn = document.getElementById("info");

    var span = document.getElementsByClassName("close")[0];

    btn.onclick = function() {
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if( event.target === modal ) {
            modal.style.display = "none";
        }
    }

    // Focus on the input element, where user's type their messages
    $( "#msg-field" ).focus();
    // Scroll the message container element to the bottom, so users see the most recent messages
    $( '#msg-container' ).scrollTop( $( '#msg-container' )[0].scrollHeight );

    // Variables for the Empathy bot's voice ( text to speech ) and visual
    var voiceToggle = true;     // Empathy bot's voice
    var chatMicToggle = true;   // User's Chat and Microphone toggle    // true = Microphone    // false = Chat box
    var CHAT = false, MIC = true;

    // Functions for reading a User's speech
        // onAnythingSaid runs every time the User says something
        // Mark the User as currently active, so the Empathy bot does not interrupt them
        function onAnythingSaid( text ) {
            console.log( "onAnythingSaid: " + text );
            socket.emit( 'active' );
        }
        // onFinalised runs when the User stops talking
        function onFinalised( text ) {
            socket.emit( 'message', text );
        }
        // onFinishedListening runs when the Speech Recognition closes - unused
        function onFinishedListening() {}
    // Start event listener for Speech Recognition
    var listener = new SpeechToText( onAnythingSaid, onFinalised, onFinishedListening );
    listener.startListening();

    // User Chat / Microphone toggle button event handler
    $( '#mode-button' ).click( function() {
        var main = $('#main-container');
        const api = pJSDom[0].pJS.fn.modes
        $('#main-container').not( main ).hide();

        // Toogle to User Microphone, disable Chat box
        if( $(this).find('span').hasClass('fa-microphone') ){
            particleConfig.x = window.pJSDom[0].pJS.canvas.w / 2;
            particleConfig.y = window.pJSDom[0].pJS.canvas.h/2;
            particleConfig.sx = 20;
            particleConfig.sy = 20;
            $(this).find('span').removeClass( 'fa-microphone' );
            $(this).find('span').addClass( 'fa-keyboard-o' );
            main.animate({ left: ["-100%", "swing"] }, 500 );
            listener.startListening();
            chatMicToggle = MIC;
        }
        // Toggle to Chat box, disable User Microphone
        else if( $(this).find('span').hasClass('fa-keyboard-o') ){
            particleConfig.x = window.pJSDom[0].pJS.canvas.w/7*5.5;
            particleConfig.y = window.pJSDom[0].pJS.canvas.h/11*4.5;
            particleConfig.sx = 12;
            particleConfig.sy = 12;
            $(this).find('span').removeClass( 'fa-keyboard-o' );
            $(this).find('span').addClass( 'fa-microphone' );
            main.animate({ left: ["18%", "swing"] }, 500 );
            listener.stopListening();
            chatMicToggle = CHAT;
        };
    });

    // Volume button click event handler
    $( '#volume-button' ).click( function() {
        // Toggle Empathy bot's voice: OFF
        if( $(this).find('span').hasClass( 'glyphicon-volume-up' ) ) {
            $(this).find('span').removeClass( 'glyphicon-volume-up' );
            $(this).find('span').addClass( 'glyphicon-volume-off' );
            voiceToggle = false;
            window.speechSynthesis.cancel();
        }
        // Toggle Empathy bot's voice: ON
        else if( $(this).find('span').hasClass( 'glyphicon-volume-off' ) ) {
            $(this).find('span').removeClass( 'glyphicon-volume-off' );
            $(this).find('span').addClass( 'glyphicon-volume-up' );
            voiceToggle = true;
        }
    });

    // Event: User is typing a message - mark the User as currently active, so the Empathy bot does not interrupt them
    $( '#msg-field' ).on( 'keydown', function() {
        socket.emit( 'active' );
    });

    // Event: User submits a typed message
    $( '#msg-submit' ).on( 'click', function( event ) {
        event.preventDefault();
        socket.emit( 'message', $( '#msg-field' ).val() );
        $( '#msg-field' ).val( '' );
    });

    // Event: Server gives a message to the User's Socket, and renders it on their page
    socket.on( 'renderMessage', function( data ) {
        if( data.bot ) {
            if( data.text === ':del' ) {
                $( '#msg-container div:last-child' ).remove();
            }
            else if( data.text[0] === ':' ) {
                // $( '#msg-container' ).append( '<div class="bot-sub-msg">' + data.text.slice(1) + '</div>' );
                var lastMsgText = $( '#msg-container div:last-child' ).text();
                $( '#msg-container div:last-child' ).text( lastMsgText + ' ' + data.text.slice(1) );
            }
            else {
                $( '#msg-container' ).append( '<div class="bot-msg">' + data.text + '</div>' );
                if( voiceToggle ) useTextToSpeech( data.text );
            }
        }
        else {
            $( '#msg-container' ).append( '<div class="user-msg"><p class="right"></p></div>' );
            // Protect against User inputting html elements
            $( '#msg-container div:last-child p' ).text( data.text );
        }

        // Scroll the message container element to the bottom, so users see the most recent messages
        $( '#msg-container' ).scrollTop( $( '#msg-container' )[0].scrollHeight );
    });

    // Event: User opens the web page ( or refreshes ), previous Empathy bot speeches should be cancelled
    socket.on( 'connect', function() {
        window.speechSynthesis.cancel();
    });
});
