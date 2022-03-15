# DialogHandler

## Install
Install the client library for dialogflow
```
$ pip3 install google-cloud-dialogflow
```

## Set Environment Variable
Provide authentication credentials to your application code by setting the environment 
variable `GOOGLE_APPLICATION_CREDENTIALS`. This variable only applies to your current shell 
session, so if you open a new session, set the variable again.
```
macOS/Linux -> $ export GOOGLE_APPLICATION_CREDENTIALS="<path to service-account-file.json>"
```
or in Python so you don't have to set it everytime
```
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "<path to service-account-file.json>"
```

See `dialogtext.py` for example usage.
