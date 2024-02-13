"""Module for handling account deletion in the Insta485 app."""


import flask
import insta485


@insta485.app.route('/accounts/delete/')
def show_delete():
    """Show the account deletion page."""
    if 'username' not in flask.session:
        return flask.redirect(flask.url_for("show_login"))
    logname = flask.session['username']
    context = {"logname": logname}
    return flask.render_template("delete.html", **context)
