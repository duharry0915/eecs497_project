"""REST API for comments."""
import flask
import insta485
from insta485.api.posts import http_auth

@insta485.app.route('/api/v1/comments/', methods = ['POST'])
def add_a_comment():
    """Create one comment for a specific post. Return 201 on success."""
    connection = insta485.model.get_db()
    authentication = None
    username = None
    password = None
    cur = connection.execute(
        "SELECT * FROM posts ORDER BY postid DESC LIMIT 1"
    )
    largest_post = cur.fetchone()
    post_id = flask.request.args.get('postid')
    if int(post_id) > largest_post['postid']:
        context = {"message": "Not Found", "status_code": 404}
        return flask.jsonify(**context), 404
    if flask.request.authorization:
        username, password, authentication = http_auth(connection, username, password, authentication)    
    if 'username' not in flask.session and not authentication:
        context = {"message": "Forbidden", "status_code": 403}
        return flask.jsonify(**context), 403
    if not username:
        username = flask.session['username']
    text = flask.request.json.get("text")
    connection.execute(
                "INSERT INTO comments (owner, postid, text) VALUES (?, ?, ?)",
                (username, post_id, text)
            )
    connection.commit()
    cur = connection.execute(
        "SELECT last_insert_rowid() FROM comments"
    )
    new_inserted_comment_id = cur.fetchone()
    context = {"commentid": new_inserted_comment_id,
            "lognameOwnsThis": True,
            "owner": username,
            "ownerShowUrl": "/users/" + username + '/',
            "text": text,
            "url": "/api/v1/comments/" + str(new_inserted_comment_id) + '/'}
    return flask.jsonify(**context), 201

@insta485.app.route('/api/v1/comments/<commentid>/', methods = ['DELETE'])
def delete_a_comment(commentid):
    """Delete one comment"""
    context = {}
    connection = insta485.model.get_db()
    authentication = None
    username = None
    password = None
    if flask.request.authorization:
        username, password, authentication = http_auth(connection, username, password, authentication)    
    if 'username' not in flask.session and not authentication:
        context = {"message": "Forbidden", "status_code": 403}
        return flask.jsonify(**context), 403
    if not username:
        username = flask.session['username']
    existing_comment = connection.execute(
        "SELECT * FROM comments WHERE commentid = ?",
        (commentid)
        ).fetchone()
    if not existing_comment:
        return flask.jsonify(**context), 404
    existing_comment = connection.execute(
        "SELECT * FROM comments WHERE owner = ? AND commentid = ?",
        (username, commentid)
        ).fetchone()
    if existing_comment is not None:
        connection.execute(
            "DELETE FROM comments WHERE owner = ? AND commentid = ?",
            (username, commentid)
            )
        connection.commit()
        return flask.jsonify(**context), 204
    else:
       return flask.jsonify(**context), 403
