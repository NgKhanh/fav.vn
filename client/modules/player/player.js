/*Template.video.source = function(){	
	return Session.get("currentSongSource");
}

Template.video.created = function(){	
	//console.log("-------> video created");
}

Template.video.rendered = function(){
	//console.log("-------> video rendered");
	setTimeout(function(){
		var myVideo=document.getElementById("myVideo"); 			
			myVideo.load();
			myVideo.play();
			myVideo.addEventListener('ended',nextSong,false);
	},500);
}
*/
/*
var audio;

Template.player.source = function(){	
	return Session.get("currentSongSource");
}



Template.player.rendered = function(){
	console.log("-------> player rendered");
	if(audio && audio[0]){
		audio[0].load(Session.get("currentSongSource"));
		audio[0].play();
	}
}*/

// Khai bao bien audio
var audio;
var player;
Template.player.rendered = function(){	
	console.log("-------------------------------------------> Template.player.rendered");
	audiojs.events.ready(function() {
		var a  = audiojs.createAll({		
			autoplay:true,
			imageLocation: '/modules/player/audiojs/player-graphics.gif',
			swfLocation: '/modules/player/audiojs/audiojs.swf',
			trackEnded: function() {
				console.log("Hat xong roi"); 
				nextSong();
			}
		});		
		audio = a[0];		
	});	
	
	$(".audiojs").hide();
	$("#adPlayer").hide();
	
	// Youtube
	var params = { allowScriptAccess: "always" };
	var atts = { id: "myytplayer" };
	swfobject.embedSWF("http://www.youtube.com/v/M7lc1UVf-VE?enablejsapi=1&playerapiid=ytplayer&version=3",
						"ytapiplayer", "448", "252", "8", null, null, params, atts);
						
	
					
}

	
onYouTubePlayerReady = function (playerId) {
	console.log("##################### VIDEO READY #########################");
	player = document.getElementById("myytplayer");
	player.loadVideoById('5cn1qTKwBCc');	
	
	$("#myytplayer").show();
	$("#ytapiplayer").show();
	
	setTimeout(function(){
		$("#page2 .slideHeader").css("height","330px");
		$('#chatlist').slimScroll({	
			height: '150px',
			opacity:1,
			railOpacity:1
		});	
	},2500);
}
	  
stopVideo = function () {
    player.stopVideo();
}	  
	  
onPlayerStateChange = function(event){
	console.log("Player's new state: " + event);
	
	/*if (event.data == YT.PlayerState.PLAYING && !done) {
		setTimeout(stopVideo, 6000);
		done = true;
	}*/
		
}

playSong=function(_source){	
	if ( audio ) {
		audio.load(_source);
        audio.play();
	}	
}

nextSong = function(){	
	var next = parseInt($("#albumPlaylist").find("#"+Session.get("currentSong")).attr("index")) + 1;	
	if(next==listSongInMyListeningAlbum.length)	
		next = 0;	
	
	var song = listSongInMyListeningAlbum[next];	
	
	console.log(" ---> end song >> next", next);
	
	Session.set("currentSong", song._id);
	Session.set('currentSongSource', song.source);
	activePlaylistItem();
}

activePlaylistItem=function(){
	var scroll =  $("#albumPlaylist").find("li").each(function(index){
   			if($(this).attr("id") == Session.get("currentSong")){
   				$(this).addClass("active");
   			}else{
   				$(this).removeClass("active");
   			}
	});
	
	playSong(Session.get('currentSongSource'));
}