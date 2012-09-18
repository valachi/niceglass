$ ->

  hideFlash = ->
    $('.alert-success, .alert-error').animate top: -50, 1000

  $('.alert-success, .alert-error').animate top: 0, 500
  setTimeout hideFlash, 1500