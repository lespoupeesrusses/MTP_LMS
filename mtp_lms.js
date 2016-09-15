function MTP_LMS() {
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


  this.sendModuleCompletion = function(params) {
    var dataModule = {
      event: 'create_training_module_completion',
    }

    if ((params.callback != undefined) && (typeof params.callback == 'function')) {
      this.callbackModuleCompletion = params.callback;
      delete params.callback;
    }

    dataModule = this.mergeObjects(dataModule, params);

    this.sendToLMS(dataModule);
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
        if ((_self.callbackModuleCompletion != undefined) && (typeof _self.callbackModuleCompletion == 'function')) {
          _self.callbackModuleCompletion(event.data);
          delete _self.callbackModuleCompletion;
        }
        break;
    }
  };

  // mode can be "read-only" or "normal"
  this.getMode = function() {
    var mode = this.getQueryParams(location.search).mode;
    return mode;
  }

  this.mergeObjects = function(obj1, obj2) {
    for (var key in obj2) {
      obj1[key] = obj2[key];
    }
    return obj1;
  }

  this.getQueryParams = function(qs) {
      qs = qs.split('+').join(' ');

      var params = {},
          tokens,
          re = /[?&]?([^=]+)=([^&]*)/g;

      while (tokens = re.exec(qs)) {
          params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
      }

      return params;
  }



  window.addEventListener('message', _self.callbackFromLMS, false);

}
