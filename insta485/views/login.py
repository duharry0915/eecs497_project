"""Module for handling login functionality in the Insta485 app."""


import flask
import insta485


@insta485.app.route('/accounts/login/')
def show_login():
    """Display the login page or redirect if already logged in."""
    if 'username' in flask.session:
        return flask.redirect(flask.url_for("show_index"))
    return flask.render_template('login.html')
