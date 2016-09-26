var pageLimit=140;
  $(document).ready(function() {
    for(var i = 1; i <= pageLimit; i++) {
    $('#board').append('<li class="class-'+i+'"></li>')
  }
});
