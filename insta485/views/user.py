"""
Insta485 index (main) view.

URLs include:
/users/<user_url_slug>/
"""
import flask
import insta485


@insta485.app.route('/users/<user_url_slug>/')
def show_user(user_url_slug):
    """Display /users/<user_url_slug>/ route."""
    if 'username' not in flask.session:
        return flask.redirect(flask.url_for("show_login"))

    connection = insta485.model.get_db()

    cur = connection.execute(
        "SELECT username, fullname, filename "
        "FROM users "
        "WHERE username == ?",
        (user_url_slug,)
    )
    users = cur.fetchall()

    cur = connection.execute(
        "SELECT username1, username2 "
        "FROM following "
        "WHERE username1 == ? OR username2 == ?",
        (user_url_slug, user_url_slug)
    )
    following = cur.fetchall()

    cur = connection.execute(
        "SELECT * "
        "FROM posts "
        "WHERE owner == ?",
        (user_url_slug,)
    )
    posts = cur.fetchall()
    total_posts = 0

    total_posts = len(posts)

    num_followers = 0
    num_following = 0
    for follow in following:
        if follow["username1"] == user_url_slug:
            num_following += 1
        if follow["username2"] == user_url_slug:
            num_followers += 1

    logname = flask.session['username']
    context = {
        "users": users, "following": following, "posts": posts,
        "user_url_slug": user_url_slug, "total_posts": total_posts,
        "num_followers": num_followers, "num_following": num_following,
        "logname": logname
    }
    return flask.render_template("user.html", **context)
