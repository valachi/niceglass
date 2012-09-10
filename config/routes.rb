Niceglass::Application.routes.draw do
  root to: 'pages#index'
  match 'gallery', to: 'pages#gallery', as: :gallery
  match 'services', to: 'pages#services', as: :services
  match 'contacts', to: 'pages#contacts', as: :contacts
end