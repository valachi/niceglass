require 'bundler/capistrano'
load 'deploy/assets'

server '5.9.59.102', :app, :web, :db, primary: true
set :deploy_to, '~'
set :user, 'niceglass'
set :use_sudo, false
ssh_options[:forward_agent] = true
set :rails_env, :production

set :deploy_via, :remote_cache
set :repository,  "https://github.com/valachi/niceglass.git"
set :scm, :git

set :normalize_asset_timestamps, false
set :shared_children, shared_children + %w[public/uploads]

namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "touch #{current_path}/tmp/restart.txt"
  end
end