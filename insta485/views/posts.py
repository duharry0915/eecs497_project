"""
Insta485 index (main) view.

URLs include:
/posts/<postid_url_slug>/
"""
import flask
import insta485


@insta485.app.route('/posts/<postid_url_slug>/')
def posts(postid_url_slug):
    """Display /posts/<postid_url_slug>/ route."""
    if 'username' not in flask.session:
        return flask.redirect(flask.url_for("show_login"))

    # Fetch the post details
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT * FROM posts WHERE postid == ?",
        (postid_url_slug,)
    )
    post = cur.fetchone()

    # Query Database
    cur = connection.execute(
        "SELECT * "
        "FROM likes "
        "WHERE owner != ?",
        ("",)
    )
    likes = cur.fetchall()

    cur = connection.execute(
        "SELECT * "
        "FROM users "
        "WHERE username != ?",
        ("",)
    )
    users = cur.fetchall()

    cur = connection.execute(
        "SELECT * "
        "FROM comments "
        "WHERE postid == ?",
        (postid_url_slug,)
    )
    comments = cur.fetchall()

    logname = flask.session['username']

    context = {
        "users": users, "logname": logname, "comments": comments,
        "likes": likes, "postid_url_slug": postid_url_slug, "post": post}

    return flask.render_template("posts.html", **context)
