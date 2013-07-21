/**
 * ...
 * @author khacthanh.1985@gmail.com
 */

Template.reviewPlaylistInfo.info=function(){
	if(Session.get("reviewRoom")=="")return null;
	
	var _album =  Album.findOne({_id:Session.get("reviewRoom")});	
		_album.timeAgo 		=  timeAgo(_album.createTime);		
		_album.length 		= _album.numSong;
		_album.cover 		= (_album.cover)?_album.cover:getCoverAlbum(_album.genre);
		_album.isAdmin   	= Session.get("isAdmin");		
		_album.url   		= AbsoluteUrl() + "a/"+title2Alias(_album.title) +"."+_album._id;    
	return _album;
}

Template.reviewPlaylistInfo.created=function(){
	//console.log(" --- > playlistInfo Created");
}

Template.reviewPlaylistInfo.rendered=function(){
	if(Session.get("reviewRoom")=="")return null;
	var _album 		=  Album.findOne({_id:Session.get("reviewRoom")});	
		_album.url  = AbsoluteUrl() + "a/"+title2Alias(_album.title) +"."+_album._id;  
	
}


Template.reviewPlaylist.data=function(){	
	if(Session.get("reviewRoom")=="")return null;		
	
	var playlist = Song.find({albumID:Session.get("reviewRoom")}).fetch();	
	var song;
	var arr=[];
	for (var i=0;i<playlist.length;i++) {
		song 				= playlist[i];		
		song.index			= i;
		song.index1 		= i+1;
		song.timeAgo		= timeAgo(song.createTime);		
		arr.push(song);
	}	
	return arr;
}

Template.reviewPlaylist.rendered=function(){	
	$('#reviewPlaylist').slimScroll({			
		height: '380px'
	});
}
