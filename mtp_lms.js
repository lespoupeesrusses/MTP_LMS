function MTP_LMS() {

  this.ROOT_URL = 'https://my.lancome.com/';
  var _self = this;

  this.createCommunityPost = function(params) {
    var dataPost = {
      event: 'create_community_post'
    }

    if ((params.callback != undefined) && (typeof params.callback == 'function')) {
      this.callbackCommunityPost = params.callback;
      delete params.callback;
    }

    dataPost = this.mergeObjects(dataPost, params);
    this.sendToLMS(dataPost);
  };


  this.moduleWon = function(params) {
    var dataTraining = {
      event: 'create_training_module_completion',
    }

    if ((params.callback != undefined) && (typeof params.callback == 'function')) {
      this.callbackModuleWon = params.callback;
      delete params.callback;
    }

    dataTraining = this.mergeObjects(dataTraining, params);

    this.sendToLMS(dataTraining);
  };

  this.sendToLMS = function(object) {
    var dataString = JSON.stringify(object);
    window.top.postMessage(dataString, '*');
  };

  this.callbackFromLMS = function(event) {
    switch (event.data.event) {

      case 'create_community_post' :
        if ((_self.callbackCommunityPost != undefined) && (typeof _self.callbackCommunityPost == 'function')) {
          _self.callbackCommunityPost(event.data);  
          delete _self.callbackCommunityPost;
        }
        break;      
    
      case 'create_training_module_completion' :
        if ((_self.callbackModuleWon != undefined) && (typeof _self.callbackModuleWon == 'function')) {
          _self.callbackModuleWon(event.data);  
          delete _self.callbackModuleWon;
        }
        break;    
    }
  };

  this.mergeObjects = function(obj1, obj2) {
    for (var key in obj2) {
      obj1[key] = obj2[key];
    }

    return obj1;
  }

  window.addEventListener('message', _self.callbackFromLMS, false);
  
}