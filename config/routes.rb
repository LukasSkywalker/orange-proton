OrangeProton::Application.routes.draw do
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  mount API => '/'
  root :to => 'home#index'

  # See how all your routes lay out with "rake routes"
end
