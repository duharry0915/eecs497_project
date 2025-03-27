"""
Insta485 index (main) view.

URLs include:
/
"""
import pathlib
import uuid
import hashlib
import os
import flask
from flask import request, session, url_for
import arrow
import insta485


# @insta485.app.route("/", defaults={"path": ""})
# @insta485.app.route("/<path:path>")
# def catch_all(path):
#     """Serve the React frontend for any unknown routes."""
#     return flask.render_template("index.html")



@insta485.app.route('/')
def show_index():
    """Display / route."""
    if 'username' not in flask.session:
        return flask.redirect(flask.url_for("show_login"))

    logname = flask.session['username']
    #context = {"logname": logname}

    return flask.render_template("index.html")


# @insta485.app.route('/likes/', methods=['POST'])
# def like_or_unlike():
#     """Process like or unlike actions on posts."""
#     operation = flask.request.form['operation']
#     postid = flask.request.form['postid']
#     connection = insta485.model.get_db()
#     username = session['username']
#     target = request.args.get('target', '/')
#     if operation == 'like':
#         existing_like = connection.execute(
#             "SELECT * FROM likes WHERE owner = ? AND postid = ?",
#             (username, postid)
#             ).fetchone()
#         if existing_like is None:
#             connection.execute(
#                 "INSERT INTO likes (owner, postid) VALUES (?, ?)",
#                 (username, postid)
#                 )
#         else:
#             flask.abort(409)
#     elif operation == 'unlike':
#         existing_unlike = connection.execute(
#             "SELECT * FROM likes WHERE owner = ? AND postid = ?",
#             (username, postid)
#         ).fetchone()
#         if existing_unlike is not None:
#             connection.execute(
#                 "DELETE FROM likes WHERE owner = ? AND postid = ?",
#                 (username, postid)
#                 )
#         else:
#             flask.abort(409)
#     connection.commit()
#     return flask.redirect(target if target else flask.url_for("show_index"))


# @insta485.app.route('/comments/', methods=['POST'])
# def add_comment():
#     """Add a comment to a post."""
#     # session['username'] = 'awdeorio'
#     operation = flask.request.form['operation']
#     username = session['username']
#     target = request.args.get('target', '/')
#     connection = insta485.model.get_db()
#     if operation == 'create':
#         text = flask.request.form['text']
#         postid = flask.request.form['postid']
#         if not text:
#             flask.abort(400)
#         else:
#             connection.execute(
#                 "INSERT INTO comments (owner, postid, text) VALUES (?, ?, ?)",
#                 (username, postid, text)
#             )
#     elif operation == 'delete':
#         commentid = flask.request.form['commentid']
#         comment_owner = connection.execute(
#             "SELECT owner FROM comments WHERE commentid = ? ",
#             (commentid, )
#         ).fetchone()
#         if comment_owner['owner'] == username:
#             connection.execute(
#                 "DELETE FROM comments WHERE commentid = ?",
#                 (commentid, )
#             )
#         else:
#             flask.abort(403)
#     connection.commit()
#     return flask.redirect(target if target else flask.url_for("show_index"))


# @insta485.app.route('/posts/', methods=['POST'])
# def add_post():
#     """Add a new post."""
#     # session['username'] = 'awdeorio'
#     username = session['username']
#     operation = flask.request.form['operation']
#     target = request.args.get('target', None)
#     connection = insta485.model.get_db()
#     if operation == 'create':
#         fileobj = flask.request.files["file"]
#         filename = fileobj.filename
#         print(filename)
#         if not fileobj:
#             flask.abort(400)
#         else:
#             stem = uuid.uuid4().hex
#             suffix = pathlib.Path(filename).suffix.lower()
#             uuid_basename = f"{stem}{suffix}"
#             path = insta485.app.config["UPLOAD_FOLDER"]/uuid_basename
#             fileobj.save(path)
#             connection.execute(
#                 "INSERT INTO posts (owner, filename) VALUES (?, ?)",
#                 (username, uuid_basename)
#             )
#     elif operation == 'delete':
#         postid = flask.request.form['postid']
#         post = connection.execute(
#             "SELECT * FROM posts WHERE postid = ?",
#             (postid, )
#         ).fetchone()
#         if not post or post['owner'] != username:
#             flask.abort(403)
#         path = pathlib.Path(insta485.app.config["UPLOAD_FOLDER"]) \
#             / post['filename']
#         if path.exists():
#             path.unlink()
#         connection.execute(
#             "DELETE FROM posts WHERE postid = ?",
#             (postid, )
#             )
#     connection.commit()
#     return flask.redirect(
#         target if target else url_for("show_user", user_url_slug=username)
#         )


# @insta485.app.route('/following/', methods=['POST'])
# def follow_or_not():
#     """Toggle following status between users."""
#     # session['username'] = 'awdeorio'
#     operation = flask.request.form['operation']
#     username = flask.request.form['username']
#     logname = flask.session.get('username')
#     target = request.args.get('target', '/')
#     connection = insta485.model.get_db()
#     existing_relationship = connection.execute(
#         "SELECT * FROM following WHERE username1 = ? AND username2 = ?",
#         (logname, username)
#     ).fetchone()

#     if operation == 'follow':
#         if existing_relationship:
#             flask.abort(409)
#         else:
#             connection.execute(
#                 "INSERT INTO following (username1, username2) VALUES (?, ?)",
#                 (logname, username)
#             )
#     elif operation == 'unfollow':
#         if not existing_relationship:
#             flask.abort(409)
#         else:
#             connection.execute(
#                 "DELETE FROM following WHERE username1 = ? AND username2 = ?",
#                 (logname, username)
#             )
#     connection.commit()
#     return flask.redirect(target if target else flask.url_for("show_index"))


@insta485.app.route('/accounts/logout/', methods=['POST'])
def logout():
    """Log out the current user."""
    flask.session.clear()
    return flask.redirect('/accounts/login/')


@insta485.app.route('/accounts/', methods=['POST'])
def accounts():
    """Handle account actions such as login, account creation, and deletion."""
    # session['username'] = 'awdeorio'
    operation = flask.request.form['operation']
    if operation == 'login':
        return login()
    if operation == 'create':
        return create()
    if operation == 'delete':
        return func_delete()
    if operation == 'edit_account':
        return edit_account()
    if operation == 'update_password':
        return func_update()
    return flask.abort(404)


def login():
    """Authenticate a user and initiate a session."""
    target = request.args.get('target', '/')
    connection = insta485.model.get_db()
    username = flask.request.form['username']
    password = flask.request.form['password']
    user = connection.execute(
        'SELECT password FROM users WHERE username == ?',
        (username,)
    ).fetchone()
    if not user:
        flask.abort(403)
    algorithm, salt, password_hash = user['password'].split('$')
    hash_obj = hashlib.new(algorithm)
    password_salted = salt + password
    hash_obj.update(password_salted.encode('utf-8'))
    password_hash = hash_obj.hexdigest()
    password = "$".join([algorithm, salt, password_hash])
    if username == '' or password == '':
        flask.abort(400)
    authentication = connection.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (username, password)
    ).fetchone()
    if not authentication:
        flask.abort(403)
    flask.session['username'] = username
    return flask.redirect(flask.url_for("show_index"))


def func_delete():
    """Delete the current user's account with their posts and files."""
    target = request.args.get('target', '/')
    connection = insta485.model.get_db()
    if 'username' not in session:
        flask.abort(403)
    username = flask.session['username']

    cur = connection.execute(
        "SELECT * FROM posts WHERE owner == ?",
        (username,)
    )
    posts = cur.fetchall()
    for post in posts:
        filename = post['filename']
        os.remove(insta485.app.config['UPLOAD_FOLDER']/filename)

    cur = connection.execute(
        "SELECT * "
        "FROM users "
        "WHERE username == ?",
        (username,)
    )
    user = cur.fetchone()
    filename = user['filename']
    os.remove(insta485.app.config['UPLOAD_FOLDER']/filename)

    connection.execute(
        "DELETE FROM users WHERE username = ?",
        (username,)
    )
    connection.commit()
    # print(connection)
    session.clear()
    return flask.redirect(target)


def create():
    """Handle the creation of a new user account."""
    target = request.args.get('target', '/')
    connection = insta485.model.get_db()
    username = flask.request.form['username']
    password = flask.request.form['password']
    fullname = flask.request.form['fullname']
    email = flask.request.form['email']
    fileobj = flask.request.files["file"]
    filename = fileobj.filename
    salt = uuid.uuid4().hex
    if fileobj == '':
        flask.abort(400)
    else:
        suffix = pathlib.Path(filename).suffix.lower()
        filename = f"{salt}{suffix}"
        path = insta485.app.config["UPLOAD_FOLDER"]/filename
        fileobj.save(path)
    if username == '' or password == '' or email == '' or not fileobj:
        flask.abort(400)
    exist = connection.execute(
        "SELECT * FROM users WHERE username = ? ",
        (username, )
        ).fetchone()
    if exist:
        flask.abort(409)
    hash_obj = hashlib.new('sha512')
    password_salted = salt + password
    hash_obj.update(password_salted.encode('utf-8'))
    password_hash = hash_obj.hexdigest()
    password = "$".join(['sha512', salt, password_hash])
    connection.execute(
        ("INSERT INTO users "
         "(username, password, email, fullname, filename) "
         "VALUES (?, ?, ?, ?, ?)"),
        (username, password, email, fullname, filename)
    )
    session['username'] = username
    connection.commit()
    return flask.redirect(target)


def edit_account():
    """Update the current user's account information."""
    target = request.args.get('target', '/')
    connection = insta485.model.get_db()
    if 'username' not in session:
        flask.abort(403)
    username = flask.session['username']
    fullname = flask.request.form['fullname']
    email = flask.request.form['email']
    fileobj = request.files.get("file")
    if not fullname or not email:
        flask.abort(403)
    if fileobj and fileobj.filename != '':
        filename = fileobj.filename
        stem = uuid.uuid4().hex
        suffix = pathlib.Path(filename).suffix.lower()
        uuid_basename = f"{stem}{suffix}"
        path = insta485.app.config["UPLOAD_FOLDER"]/uuid_basename
        fileobj.save(path)
        connection.execute(
            ("UPDATE users SET fullname = ?, email = ?, filename = ? "
             "WHERE username = ?"),
            (fullname, email, uuid_basename, username)
        )
    else:
        connection.execute(
            "UPDATE users SET fullname = ?, email = ? WHERE username = ?",
            (fullname, email, username)
            )
    connection.commit()
    return flask.redirect(target)


def func_update():
    """Update the password for the current user's account."""
    target = request.args.get('target', '/')
    connection = insta485.model.get_db()
    if 'username' not in session:
        flask.abort(403)
    username = flask.session['username']
    password = flask.request.form['password']
    new_password1 = flask.request.form['new_password1']
    new_password2 = flask.request.form['new_password2']
    if not password or not new_password1 or not new_password2:
        flask.abort(400)
    user = connection.execute(
        'SELECT password FROM users WHERE username = ?',
        (username,)
        ).fetchone()
    if user:
        algorithm, salt, pass_hash = user['password'].split('$')
        hash_obj = hashlib.new(algorithm)
        hash_obj.update((salt + password).encode('utf-8'))
        if not hash_obj.hexdigest() == pass_hash:
            flask.abort(403)
    if new_password1 != new_password2:
        flask.abort(401)
    salt = uuid.uuid4().hex
    hash_obj = hashlib.new('sha512')
    password_salted = salt + new_password1
    hash_obj.update(password_salted.encode('utf-8'))
    password_hash = hash_obj.hexdigest()
    password_db_string = "$".join([algorithm, salt, password_hash])
    connection.execute(
        'UPDATE users SET password = ? WHERE username = ?',
        (password_db_string, username)
    )
    connection.commit()
    # connection.close()
    return flask.redirect(target)
