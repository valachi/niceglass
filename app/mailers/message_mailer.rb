#coding: utf-8
class MessageMailer < ActionMailer::Base
  default to: 'impulse221@yandex.ru',
          from: 'niceglass2@gmail.com'

  def sendmail(message)
    @message = message
    mail(subject: 'Новое сообщение с сайта niceglass.ru!')
  end
end
