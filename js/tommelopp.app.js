var GUI = function( $, _class ){
	var CLASS = _class +'View';
	var self = {
		
		fullscreen: function() {
			var el = document.documentElement,
				rfs = el.requestFullscreen
				|| el.webkitRequestFullScreen
				|| el.mozRequestFullScreen
				|| el.msRequestFullscreen 
			;
			
			rfs.call(el);
		},
		
		showView: function( view ) {
			console.log('showView: '+ view);
			$('.'+ CLASS).fadeOut(200, function(){
				$('.'+ CLASS +'#view'+ view).fadeIn(200);
			});
		},
		
		setHTML: function( selector, value ) {
			console.log('setHTML', '.'+ CLASS +' '+ selector, value);
			$('.'+ CLASS +' '+ selector).html( value );
		},
	};
	
	return self;
};

var Thumbback = function( $, EMIT ) {
	var question = false;
	var up = 0;
	var down = 0;
	
	var self = {

		hasQuestion: function() {
			return question != false;
		},
		
		setQuestion: function( _question ) {
			question = _question;
			self.emit('setQuestion', [_question]);
		},
		
		getQuestion: function() {
			return question;
		},
		
		start: function() {
			self.emit('start');
		},
		
		stop: function() {
			self.emit('stop');
		},

		up: function() {
			if( !self.hasQuestion() ) {
				return;
			}
			up++;
			self.emit('up', [up]);
		},
		
		down: function() {
			if( !self.hasQuestion() ) {
				return;
			}
			down++;
			self.emit('down', [down]);
		},
		
		/* EMITTER FORWARDER */
		on: function( _event, _callback ) {
			EMIT.on( _event, _callback );
		},
		emit: function( _event, _data ) {
			return EMIT.emit( _event, _data );
		}
	};
	
	return self;
}( jQuery, new Emitter('Thumbback') );

var shakeConfig = {
	direction: 'up',
	times: 1,
	duration: 200,
}

/**
 * APP -> GUI HOOKS
**/
ThumbbackGUI = new GUI( jQuery, 'Thumbback');
Thumbback.on('start', function(){ ThumbbackGUI.showView('Question') });
Thumbback.on('stop', function(){ ThumbbackGUI.showView('Summary') });
Thumbback.on('setQuestion', function(_question){ ThumbbackGUI.setHTML('.theQuestion', _question ) } );
Thumbback.on('up', function(newCount){ 
	ThumbbackGUI.setHTML('#count-up', newCount );
	$('#showUp').effect('shake', shakeConfig)
} );
Thumbback.on('down', function(newCount){ 
	ThumbbackGUI.setHTML('#count-down', newCount );
	$('#showDown').effect('shake', shakeConfig)
} );

/**
 * KEYSTROKE HOOKS
**/
$(document).on('keyup', function( e ) {
	// return if in input atm
	if( $("input").is(":focus") ) {
		return;	
	}
	if( e.keyCode == 38 ) {
		Thumbback.up();
	} else if( e.keyCode == 40 ) {
		Thumbback.down();
	} else if ( e.keyCode == 27 ) {
		Thumbback.stop();
	} else if ( e.keyCode == 70 ) {
		ThumbbackGUI.fullscreen();
	}
});

/**
 * GUI HOOKS
**/
$(document).ready(function(){
	$('#question').focus();
});

$(document).on('submit','form.thumbback',function( e ){
	e.preventDefault();
	Thumbback.setQuestion( $('#question').val() );
	Thumbback.start();
});

$(document).on('click', '.tbAction', function(){
	switch( $(this).attr('data-tb-action') ) {
		case 'stop':
			Thumbback.stop();
		break;
		
		default: 
			alert('Unsupported action '+ $(this).attr('data-tb-action') );
			break;
	}
});