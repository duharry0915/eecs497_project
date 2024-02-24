"""REST API for likes."""
import flask
import insta485
from insta485.api.posts import http_auth

@insta485.app.route('/api/v1/likes/', methods = ['POST'])
def add_a_like():
    """Create one “like” for a specific post. Return 201 on success."""
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
    existing_like = connection.execute(
        "SELECT * FROM likes WHERE owner = ? AND postid = ?",
        (username, post_id)
        ).fetchone()
    if existing_like is None:
        connection.execute(
            "INSERT INTO likes (owner, postid) VALUES (?, ?)",
            (username, post_id)
        )
        connection.commit()
        existing_like = connection.execute(
        "SELECT * FROM likes WHERE owner = ? AND postid = ?",
        (username, post_id)
        ).fetchone()
        context ={"likeid": existing_like['likeid'] + 1,
                  "url": "/api/v1/likes/" + str(existing_like['likeid']) + '/'}
        
        return flask.jsonify(**context), 201
    else:
        context ={"likeid": existing_like['likeid'],
                  "url": "/api/v1/likes/" + str(existing_like['likeid']) + '/'}
        return flask.jsonify(**context), 200
    
@insta485.app.route('/api/v1/likes/<likeid>/', methods = ['DELETE'])
def delete_a_like(likeid):
    """Delete one like"""
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
    existing_like = connection.execute(
        "SELECT * FROM likes WHERE likeid = ?",
        (likeid,)
        ).fetchone()
    if not existing_like:
        return flask.jsonify(**context), 404
    existing_like = connection.execute(
        "SELECT * FROM likes WHERE owner = ? AND likeid = ?",
        (username, likeid)
        ).fetchone()
    if existing_like is not None:
        connection.execute(
            "DELETE FROM likes WHERE owner = ? AND likeid = ?",
            (username, likeid)
            )
        connection.commit()
        return flask.jsonify(**context), 204
    else:
       return flask.jsonify(**context), 403
