# Choose-Run

# Location
# doesn't work
# curl --data "location=bantcher&dist=5&range=1" http://localhost:8080/choose-run
# curl --data "location=Grantcher&dist=5&range=1" http://localhost:8080/choose-run
# curl --data "location=&dist=5&range=1" http://localhost:8080/choose-run
# curl --data "location=baronian&dist=5&range=1" http://localhost:8080/choose-run
# curl --data "location=1256152&dist=5&range=1" http://localhost:8080/choose-run
# works
# curl --data "location=Baronian&dist=5&range=1" http://localhost:8080/choose-run
# curl --data "location=Gantcher&dist=5&range=1" http://localhost:8080/choose-run

# Distance
# doesn't work
# curl --data "location=Gantcher&dist=-10&range=1" http://localhost:8080/choose-run
# curl --data "location=Gantcher&dist=100000&range=1" http://localhost:8080/choose-run
# curl --data "location=Baronian&dist=a&range=1" http://localhost:8080/choose-run
# curl --data "location=Baronian&dist=51&range=1" http://localhost:8080/choose-run
# works
# curl --data "location=Gantcher&dist=9.99&range=1" http://localhost:8080/choose-run

# Range
# doesn't work
# curl --data "location=Gantcher&dist=5&range=-1" http://localhost:8080/choose-run
# curl --data "location=Gantcher&dist=5&range=1000" http://localhost:8080/choose-run
# curl --data "location=Gantcher&dist=5&range=1.55" http://localhost:8080/choose-run
# curl --data "location=Gantcher&dist=5&range=9.5" http://localhost:8080/choose-run
# curl --data "location=Gantcher&dist=5&range=abc" http://localhost:8080/choose-run
# works


# Add-Run

# Name
# doesn't work
# curl --data "name=Hoobyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy&gdist=5&bdist=6&url=http://gmap-pedometer.com/r?=1297163&desc=Hoobastank!" http://localhost:8080/add-run
# curl --data "name=&gdist=5&bdist=6&url=http://gmap-pedometer.com/r?=1297163&desc=Hoobastank!" http://localhost:8080/add-run
# works (after escaping the < and > chars)
# curl --data "name=<script>Poop</script>&gdist=5&bdist=6&url=http://gmap-pedometer.com/r?=1297163&desc=Hoobastank!" http://localhost:8080/add-run

# Gantcher Distance
# doesn't work
# curl --data "name=Hoob&gdist=-5&bdist=6&url=http://gmap-pedometer.com/r?=1297163&desc=Hoobastank!" http://localhost:8080/add-run
# curl --data "name=Hoob&gdist=a&bdist=6&url=http://gmap-pedometer.com/r?=1297163&desc=Hoobastank!" http://localhost:8080/add-run
# curl --data "name=Hoob&gdist=53&bdist=6&url=http://gmap-pedometer.com/r?=1297163&desc=Hoobastank!" http://localhost:8080/add-run

# Baronian Distance
# curl --data "name=Hoob&gdist=5&bdist=-6&url=http://gmap-pedometer.com/r?=1297163&desc=Hoobastank!" http://localhost:8080/add-run
# curl --data "name=Hoob&gdist=5&bdist=b&url=http://gmap-pedometer.com/r?=1297163&desc=Hoobastank!" http://localhost:8080/add-run
# curl --data "name=Hoob&gdist=5&bdist=63&url=http://gmap-pedometer.com/r?=1297163&desc=Hoobastank!" http://localhost:8080/add-run

# URL
# doesn't work
# curl --data "name=Hoob&gdist=5&bdist=6&url=poop&desc=Hoobastank!" http://localhost:8080/add-run
# curl --data "name=Hoob&gdist=5&bdist=6&url=.com&desc=Hoobastank!" http://localhost:8080/add-run
# works
# curl --data "name=Hoob&gdist=5&bdist=6&url=gmap-pedometer.com/r?=1297163&desc=Hoobastank!" http://localhost:8080/add-run

# Desc
# doesn't work
# curl --data "name=Hoob&gdist=5&bdist=6&url=http://gmap-pedometer.com/r?=1297163&desc=" http://localhost:8080/add-run
# curl --data "name=Hoob&gdist=5&bdist=6&url=http://gmap-pedometer.com/r?=1297163&desc=tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt" http://localhost:8080/add-run
# works (after escaping chars)
# curl --data "name=Hoob&gdist=5&bdist=6&url=http://gmap-pedometer.com/r?=1297163&desc=<script>Hello</script>" http://localhost:8080/add-run

