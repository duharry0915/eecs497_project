"""
Insta485 index (main) view.

URLs include:
/users/<user_url_slug>/followers/
"""
import flask
import insta485


@insta485.app.route('/users/<user_url_slug>/followers/')
def followers(user_url_slug):
    """Display the explore page to the user."""
    if 'username' not in flask.session:
        return flask.redirect(flask.url_for("show_login"))
    connection = insta485.model.get_db()
    logname = flask.session['username']

    cur = connection.execute(
        "SELECT * "
        "FROM following "
        "WHERE username2 == ?",
        (user_url_slug,)
    )
    following = cur.fetchall()

    cur = connection.execute(
        "SELECT username1, username2 "
        "FROM following "
        "WHERE username1 == ?",
        (logname,)
    )
    all_following = cur.fetchall()

    cur = connection.execute(
        "SELECT * "
        "FROM users "
        "WHERE username IS NOT NULL"
        )
    users = cur.fetchall()
    # Add database info to context
    context = {
        "users": users, "following": following,
        "logname": logname, "user_url_slug": user_url_slug,
        "all_following": all_following
        }

    return flask.render_template("followers.html", **context)
