"""Module for handling account editing functionality in the Insta485 app."""


import flask
import insta485


@insta485.app.route('/accounts/edit/')
def show_edit():
    """Display the account edit page."""
    connection = insta485.model.get_db()
    if 'username' not in flask.session:
        return flask.redirect(flask.url_for("show_login"))
    logname = flask.session['username']
    cur = connection.execute(
        "SELECT * "
        "FROM users "
        "WHERE username == ?",
        (logname,)
    )
    user = cur.fetchone()
    context = {"user": user, "logname": logname}
    return flask.render_template("edit.html", **context)
