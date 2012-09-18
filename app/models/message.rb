class Message
  include ActiveModel::Validations
  include ActiveModel::Conversion

  attr_accessor :name, :email, :subject, :body
  validates_presence_of :name, :email, :subject, :body
  validates :email, presence: true, format: {with: /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i }
  validates :name, presence: true

  def initialize(attributes = {})
    attributes.each do |name, value|
      send("#{name}=", value)
    end
  end

  def persisted?
    false
  end
end