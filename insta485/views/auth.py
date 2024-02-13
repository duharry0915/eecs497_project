"""Module for handling authentication in the Insta485 app."""


import flask
import insta485


@insta485.app.route('/accounts/auth/')
def show_auth():
    """Authenticate user session."""
    if 'username' in flask.session:
        return ('', 200)
    flask.abort(403)
