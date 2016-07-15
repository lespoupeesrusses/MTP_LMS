$( document ).ready(function() {
  var responseBox = $('#response');
  var field = $('#field');
  var submit = $('#submit');
  var lms = new MTP_LMS();
  var communityPostAdded = function(obj) {
    if (obj.status === 'ERROR') {
      responseBox.append(obj.message_status);
    } else {
      responseBox.append(obj.community_group_url);
    }
  };

  var moduleCompletionSaved = function(obj) {
    if (obj.status === 'ERROR') {
      responseBox.append(obj.message_status);
    } else {
      responseBox.append('Training Module completion saved');
    }
  };

  submit.on('click', function() {
    lms.createCommunityPost({
      content: field.val(), 
      community_group_id: 17, 
      callback: communityPostAdded
    });

    lms.moduleWon({
      success: true,
      callback: moduleCompletionSaved
    });
  });
});

