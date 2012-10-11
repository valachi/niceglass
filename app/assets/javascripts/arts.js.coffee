$ ->

  url = window.location.pathname
  $('#main ul li a[href^="' + url + '"]:first').addClass 'active'