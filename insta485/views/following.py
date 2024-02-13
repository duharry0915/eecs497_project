"""
Insta485 index (main) view.

URLs include:
/users/<user_url_slug>/followers/
"""
import flask
import insta485


@insta485.app.route('/users/<user_url_slug>/following/')
def show_following(user_url_slug):
    """Display the list of users that a specific user is following."""
    if 'username' not in flask.session:
        return flask.redirect(flask.url_for("show_login"))
    connection = insta485.model.get_db()

    cur = connection.execute(
        "SELECT * "
        "FROM users "
        "WHERE username != ? ",
        ("",)
        )
    users = cur.fetchall()

    cur = connection.execute(
        "SELECT * "
        "FROM following "
        "WHERE username1 == ?",
        (user_url_slug,)
    )
    following = cur.fetchall()

    logname = flask.session['username']
    cur = connection.execute(
        "SELECT * "
        "FROM following "
        "WHERE username1 == ?",
        (logname,)
    )
    all_following = cur.fetchall()

    # Add database info to context
    context = {
        "users": users, "following": following,
        "logname": logname, "user_url_slug": user_url_slug,
        "all_following": all_following
        }

    return flask.render_template("following.html", **context)
