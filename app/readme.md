This folder contains the main application files.

* The api answers specific requests with JSON formatted objects as specified in the [api documentation](https://docs.google.com/document/d/11Wv2WuiRtMq-3hTS1WGplNsy9FHOFJr7UCbZi7-D_FA/edit#heading=h.ddqjkkw1v38o).
* The assest directory contains static assets, accessible via the root url + '/assets' (e.g. /assets/arrow.png, /assets/application.js).
* We don't have any controllers that do work.
* The api uses the models defined in the models directory to generate the answers for the requests made by the application via AJAX.
* Last but not least, the views directory contains our main page, index.html(.erb).
