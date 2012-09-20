$ ->
  form = $('form')
  inputs = $('input,textarea')
  sendingMail = null

  $('#new_message').submit ->
    inputs.removeClass 'error_input'
    emptyInputs = (input for input in inputs when $(input).val() == '')
    if emptyInputs.length
      $(input).addClass 'error_input' for input in emptyInputs
      return false

    if sendingMail
      sendingMail.abort()
      console.log 'abort'

    sendingMail = $.ajax
      type: 'POST'
      url: form.attr 'action'
      data: form.serialize()
      beforeSend: ->
        $('#loading').show()
      complete: ->
        $('#loading').hide()
        $('input, textarea').val ''
        sendingMail = null
      success: ->
        $('#loading').hide()
        $('#success').show()
      error: ->
        $('#loading').hide()
        $('#error').show()
    false