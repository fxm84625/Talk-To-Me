//mode
$('document').ready(function() {
    $('#mode').click( function() {
        var $div = $('#main-container');
        var $main = $('#visuals');
        $('#main-container').not($div).hide();

        if($(this).find('span').hasClass('fa fa-microphone icon')){
          $(this).find('span').removeClass('fa fa-microphone icon');
          $(this).find('span').addClass('fa fa-keyboard-o icon');
          $div.animate({left: ["-=1000px", "swing"], opacity: ["toggle", "swing"]}, 500);
          $main.animate({width:["40%", "swing"], right:["30%","swing"], top:["30%", "swing"]}, 500);
        } else if($(this).find('span').hasClass('fa fa-keyboard-o icon')){
        $(this).find('span').removeClass('fa fa-keyboard-o icon');
        $(this).find('span').addClass('fa fa-microphone icon');
        $div.animate({left: ["18%", "swing"], opacity: ["toggle", "swing"]}, 500);
        $main.animate({width:["18%", "swing"], right:["10%","swing"], top:["23%", "swing"]}, 500);
      };
    });

    // width: [ "toggle", "swing" ]
    // $div.slideToggle();

    //volume

      $('#vol').click( function() {
        if ($(this).find('span').hasClass('glyphicon glyphicon-volume-up icon')){
          $(this).find('span').removeClass('glyphicon glyphicon-volume-up icon');
          $(this).find('span').addClass('glyphicon glyphicon-volume-off icon');
        } else if ($(this).find('span').hasClass('glyphicon glyphicon-volume-off icon')){
          $(this).find('span').removeClass('glyphicon glyphicon-volume-off icon');
          $(this).find('span').addClass('glyphicon glyphicon-volume-up icon');
        }
      });
});



//visuals
particlesJS('particles-js', {
      "particles": {
        "number": {
          "value": 1,
          "density": {
            "enable": false,
            "value_area": 481.0236182596568
          }
        },
        "color": {
          "value": "#ffffff"
        },
        "opacity": {
          "value": 0.5,
          "random": false,
          "anim": {
            "enable": false,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 0,
          "random": true,
          "anim": {
            "enable": false,
            "speed": 10,
            "size_min": 0.1,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 48.10236182596568,
          "color": "#ffffff",
          "opacity": .7,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 2,
          "direction": "none",
          "random": false,
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
            "enable": false,
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
            "distance": 400,
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
    })

    const api = pJSDom[0].pJS.fn.modes

    var videoInput = document.getElementById('video');
    var ctracker = new clm.tracker();

    ctracker.init();
    ctracker.start(videoInput);

    function gumSuccess( stream ) {
      if ("srcObject" in videoInput) {
        videoInput.srcObject = stream;
      } else {
        videoInput.src = (window.URL && window.URL.createObjectURL(stream));
      }

      videoInput.onloadedmetadata = function() {
        videoInput.play();
        setTimeout(positionLoop, 1000)
      }
    }

    function gumFail () {

    }

    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(gumFail);
    } else if (navigator.getUserMedia) {
      navigator.getUserMedia({video : true}, gumSuccess, gumFail);
    } else {
      alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
    }

    var old;
    function positionLoop() {
      // requestAnimFrame(positionLoop);
      var positions = ctracker.getCurrentPosition();
      // if(!old) old = positions;
			// var delta = positions.map((item,ix) => [item[0]-old[ix][0], item[1]-old[ix][1]]);
      // print the positions
      // old = positions;
      var positionString = "";
      if (positions) {
        for (var p = 0;p < 10;p++) {

          // api.repulseParticle(pos_x: (delta[p][0]), pos_y: (delta[p][1]));
          //console.log(p, positions[p][0], positions[p][1])
          //positionString += "featurepoint "+p+" : ["+positions[p][0].toFixed(2)+","+positions[p][1].toFixed(2)+"]<br/>";
        }
        api.pushParticles(3, {pos_x: positions[0][0], pos_y: positions[0][1]})
        api.removeParticles(2)
        // console.log(positionString);
        // api.repulseParticle({x: positions[p][0], y: positions[p][1]});
        // console.log(delta[0][0], delta[0][1]);
      }
    }

    setInterval(positionLoop, 1000);
    // positionLoop();


//modal
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
      if (event.target == modal) {
          modal.style.display = "none";
      }
    }

//index
$( document ).ready( function() {
    // Client side Socket connection
    // Server side Socket event handlers are in /server/socket.js
    var url = $( location ).attr( 'host' );
    var socket = io.connect( url );

    // Focus on the input element, where user's type their messages
    $( "#msg-field" ).focus();
    // Scroll the message container element to the bottom, so users see the most recent messages
    $( '#msg-container' ).scrollTop( $( '#msg-container' )[0].scrollHeight );

    // Variables for the Empathy bot's voice ( text to speech ) and visual
    var voiceToggle = false;
    var visualToggle = false;

    // Handle toggling Empathy bot voice and visual
    $( '#voice-toggle' ).on( 'change', function() {
        voiceToggle = $( this ).prop( 'checked' );
        if( !voiceToggle ) window.speechSynthesis.cancel();
    });
    $( '#visual-toggle' ).on( 'change', function() {
        visualToggle = $( this ).prop( 'checked' );
    });

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
