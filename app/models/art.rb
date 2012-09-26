class Art < ActiveRecord::Base
  attr_accessible :desc, :image, :title
  mount_uploader :image, ImageUploader
end
