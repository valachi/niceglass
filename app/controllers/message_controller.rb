#coding: utf-8
class MessageController < ApplicationController
  def send_email
    message = Message.new(params[:message])
    if message.valid?
      MessageMailer.sendmail(message).deliver
      redirect_to root_path, notice: "Ваше сообщение отправлено, спасибо!"
    else
      redirect_to :back, alert: "Пожалуйста, заполните все формы"
    end
  end
end
