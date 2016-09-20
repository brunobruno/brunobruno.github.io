var pageLimit=140;
  $(document).ready(function() {
    for(var i = 1; i <= pageLimit; i++) {
    $('body').append('<div class="class-'+i+'"></div>')
  }
});
