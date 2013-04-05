This folder contains the backend or the "algorithms" for figuring out the mapping between ICD codes and Fachgebiete (this is mainly the job of the information_providers).

The other files in this folder implement other api queries (however e.g. the doctor_locator is not used directly, but rather used any of the database_info_providers). Some are also helpers for some information provider.

The information_interface combines the results and returns them to the api.
