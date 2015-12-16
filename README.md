run-generator
=============

The following is a web application I made for the Tufts University XC team that displays runs on campus.

It allows the user to input his starting location (one of two locations on campus), the preferred run distance, and his flexibility in miles, and it returns a list of runs that meets those parameters.

It also allows a user to submit a new run, given he submits all the required fields under the right conditions.

The architecture is as follows:
Static HTML pages <--> AngularJS <--> ExpressJS <--> MongoDB

From left to right: A user makes an HTTP request, which Angular processes and feeds to the server. The server can
then access the database, fetching viable information.

From right to left: The server takes JSON data from the database and feeds it to Angular, which can display the
information directly on the web page, without having to reload the page.

The app can be found at: http://rungenerator.herokuapp.com/
