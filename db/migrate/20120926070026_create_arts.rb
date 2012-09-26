class CreateArts < ActiveRecord::Migration
  def change
    create_table :arts do |t|
      t.string :image
      t.string :title
      t.text :desc

      t.timestamps
    end
  end
end
