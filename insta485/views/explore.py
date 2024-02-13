"""
Insta485 index (main) view.

URLs include:
/explore/
"""
import flask
import insta485


@insta485.app.route('/explore/')
def explore():
    """Render the explore page to display users and follow/unfollow options."""
    if 'username' not in flask.session:
        return flask.redirect(flask.url_for("show_login"))

    logname = flask.session['username']
    connection = insta485.model.get_db()

    cur = connection.execute(
        "SELECT username2 "
        "FROM following "
        "WHERE username1 == ?",
        (logname,)
    )
    log_follows = cur.fetchall()

    cur = connection.execute(
        "SELECT * "
        "FROM users "
        "WHERE username != ? ",
        (logname,)
        )

    # not really sure here, check if the user exists
    users = cur.fetchall()

    context = {
        "log_follows": log_follows, "users": users, "logname": logname}

    return flask.render_template("explore.html", **context)
