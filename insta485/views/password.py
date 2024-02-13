"""Module for handling password management in the Insta485 app."""

import flask
import insta485


@insta485.app.route('/accounts/password/')
def show_password():
    """Display the account password page."""
    if 'username' not in flask.session:
        return flask.redirect(flask.url_for("show_login"))
    logname = flask.session['username']
    context = {"logname": logname}
    return flask.render_template("password.html", **context)
