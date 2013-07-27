Template.chatInput.events = {
	'keydown #chatInput':function(e){
		if(e.keyCode==13){	
			
			if(!Meteor.userId()){
				// not loggin > requires login
				$('.modal').modal('show');
				return false;
			}
			
			//console.log("submit chat ",$(e.currentTarget).val(), $(e.currentTarget).val()=="");
			// send content to chat
			var chatMsg = $(e.currentTarget).val();
				chatMsg = emoticonEncode(chatMsg);
				
			if(chatMsg!=""){
				Meteor.call("chat", chatMsg , Session.get("currentRoom"), Session.get("currentSong"), function(err, res){
					if(res){
						// chat thanh cong
						//console.log("Chat ok", res);								
					}
				})				
				$(e.currentTarget).val('');				
			}	
			
			// chan enter line
			e.preventDefault();
		}		
	}
	,'click #chatInput':function(e){		
		if(!Meteor.userId()){
			// not loggin > requires login
			$('.modal').modal('show');
			return false;
		}
	}
}

Template.oldchat.data=function(){
	if(Session.get("currentRoom")=="")return null;
	
	var _arr =  Message.find({roomID:Session.get("currentRoom"),createTime:{$lt:joinTime},"owner.username":{$ne:"SYS"}},{sort:{createTime:1}}).fetch();
	
	if(_arr.length < 1) return [];	
	var _chat = _arr[0];	
		_chat.message = emoticonDecode(String(_chat.message));
		_chat.old=true;
		
	var _listChat=[];
		_listChat.push(_chat);
		
	for(var i = 1;i<_arr.length;i++){
		_chat = _arr[i];		
		_chat.message = emoticonDecode(String(_chat.message));
		_chat.old=true;
		
		if(_chat.owner.username == _listChat[_listChat.length-1].owner.username){
			_listChat[_listChat.length-1].message += '<p>'+_chat.message+'</p>';
		}else{			
			_listChat.push(_chat);
		}
	}	
	
	return _listChat;
}

Template.realtimeChat.data=function(){
	if(Session.get("currentRoom")=="")return null;
	return Message.find({roomID:Session.get("currentRoom"),createTime:{$gt:joinTime}},{sort:{createTime:1}});
}

Template.realtimeChat.rendered=function(){	
	console.log("-----------> RealtimeChat rendered");
	$('#chatlist').slimScroll({	
		height:$('#chatlist').height()+'px',		
		scrollTo:$("#chatContent").height() + 'px'
	});	
}

Template.messageChat.created=function(){
	if(this.data){
		//console.log("-----------> messageChat created",this.data.owner.name,this.data.owner.name!="SYS");
		
		this.data.timeAgo = new Date(this.data.createTime);
		if(!this.data.old){			
			this.data.message = emoticonDecode(this.data.message);
			this.data.timeAgo = this.data.timeAgo.getHours()+':' + this.data.timeAgo.getMinutes();
		}else{			
			this.data.timeAgo = this.data.timeAgo.getHours()+':' + this.data.timeAgo.getMinutes() + ' - ' + this.data.timeAgo.getDate() +'/'+this.data.timeAgo.getMonth()+'/'+this.data.timeAgo.getFullYear();
		}
				
		var li = $('#chatlist #realtimeChat li').last();
		var info = li.find(".info");
		var username = info.attr("username");
			
		if(this.data.owner.username==username && this.data.owner.name!="SYS"){			
			li.find(".message").append('<p>'+this.data.message+'</p>');	
			this.data.message = "";
			
			// update new time
			li.find('.timeAgo').html(this.data.timeAgo);
		}
	}
}

Template.messageChat.rendered=function(){
	if(this.data){
		if(this.data.message==""){			
			$("#"+this.data._id).remove();
		}
		
		if(!this.data.old && Meteor.userId() && Meteor.user().username != this.data.owner.username){				
			//console.log("Thong bao chat moi tu",this.data.owner.name, isActive, onRoom);
			// Nếu khác thông báo hệ thống && user không vào phòng hoặc tab bị deActive
			if(this.data.owner.username!="SYS" && (isActive==false || onRoom==false)){							
				document.title = '(1) ' + defaultTitle;			
				$.titleAlert(this.data.owner.name + ' vừa chát');
			}			
			// add sound
			if(this.data.owner.username!="SYS" && inRoom==false)notiSound();			
			
			// show notification
			$("#notification").show();
			
		}
		
		$("#"+this.data._id +" .thumbnail").popover({"content":'<a class="largeAvatar" href="https://www.facebook.com/'+this.data.owner.username+'" target="_blank"><img src="https://graph.facebook.com/'+this.data.owner.username+'/picture?type=large" />'+this.data.owner.name+'</a><small class="userAction"><a href="#"> + Block<a><a href=""> + Kích khỏi phòng</a></small>',"html":true,'contaier':'body','trigger':'click'});
	}
}

