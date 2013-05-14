To set up the database, follow the following instructions:

1)  Set up a mongo server. 2.2.3 worked for us, but others should, too
2)  Create a Database called "admin" on the server and add 2 users to it
    a) Add a read-only user
    b) Add a user with write-access
3)  Shut down the mongo server and restart it using the --auth flag
4)  Update the mongo.yml file located in the folder /config
    a) Change host and port to the values used for your mongo server
    b) Update username, password and write_user with the credentials created in step 2
    c) (discouraged) change the name and location of the collections
5)  Open a terminal in the project root and run "RAILS_ENV="[environment]" rake db:seed".