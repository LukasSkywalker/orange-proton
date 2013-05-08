OrangeProton::Application.routes.draw do
  # The priority is based upon order of creation:
  # first created -> highest priority.

  root :to => 'home#index'
  mount API => '/'
  match '*path' => redirect('/')

end
