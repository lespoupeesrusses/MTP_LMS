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

  submit.on('click', function(e) {
    e.preventDefault();
    lms.createCommunityPost({
      content: field.val(),
      community_group_id: 84,
      callback: communityPostAdded
    });

    var success = $('#checkbox').is(':checked');
    console.log(success);

    lms.sendModuleCompletion({
      success: success,
      callback: moduleCompletionSaved
    });
  });

  if (lms.getMode() == "read-only") {
    $('form').hide();
    responseBox.append('You have no more tries');
  }
});
