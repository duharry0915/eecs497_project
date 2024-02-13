"""Module for handling account creation in the Insta485 app."""


import flask
import insta485


@insta485.app.route('/accounts/create/')
def show_create():
    """Display the account creation page."""
    context = {}
    return flask.render_template("create.html", **context)
