# Backend

## Install
Install `virtaulenv` if you haven't
```
pip3 install virtualenv
```
```
$ python3 -m virtualenv -p $/path/to/python3.8.10 ./venv
$ source ./venv/bin/activate
$ python3 install -r requirements.txt
```
## Run
```
$ source ./venv/bin/activate
$ python3 ./run.py
```

or if you want to use the cloud db
```
$ source ./venv/bin/activate
$ python3 ./run.py --cloud
```