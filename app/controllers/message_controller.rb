#coding: utf-8
class MessageController < ApplicationController
  def send_email
    message = Message.new(params[:message])
    if message.valid?
      MessageMailer.sendmail(message).deliver
      head :ok
    else
      head :bad_request
    end
  end
end
