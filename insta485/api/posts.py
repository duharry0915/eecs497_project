"""REST API for posts."""
import flask
import insta485
import hashlib

def http_auth(connection, username, password, authentication):
    username = flask.request.authorization['username']
    password = flask.request.authorization['password']
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
    authentication = connection.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (username, password)
    ).fetchone()
    return username, password, authentication
    
@insta485.app.route('/api/v1/', methods = ['GET'])
def get_list():
    """Return a list of services available."""
    context = {
        "comments": "/api/v1/comments/",
        "likes": "/api/v1/likes/",
        "posts": "/api/v1/posts/",
        "url": "/api/v1/"
    }
    return flask.jsonify(**context), 200

@insta485.app.route('/api/v1/posts/', methods = ['GET'])
def get_10_posts():
    """Return the 10 newest posts."""
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
    query = """SELECT p.postid FROM posts p
        WHERE p.owner IN (
            SELECT username2 FROM following WHERE username1 = ?
        ) OR p.owner = ?
        ORDER BY p.postid DESC;"""
    cur = connection.execute(query, (username, username))
    posts = cur.fetchall()
    max_postid = flask.request.args.get('postid_lte', posts[0]["postid"], type=int)
    size = flask.request.args.get('size', 10, type=int)
    page = flask.request.args.get('page', 0, type=int)
    if size <= 0 or page < 0:
        context = {"message": "Bad Request", "status_code": 400}
        return flask.jsonify(**context), 400 


    query = """
        SELECT p.postid
        FROM posts p
        WHERE (p.owner IN (SELECT username2 FROM following WHERE username1 = ?)
        OR p.owner = ?) 
    """
    params = [username, username]
    if max_postid:
        query += " AND p.postid <= ?"
        params.append(max_postid)
    query += " ORDER BY p.postid DESC LIMIT ? OFFSET ?;"
    params.extend([size, size * page])
    cur = connection.execute(query, params)
    posts = cur.fetchall()
    base_url = "/api/v1/posts/"
    results = []
    for post in posts:
        results.append({
            "postid": post["postid"],
            "url": "/api/v1/posts/" + str(post["postid"]) + "/"
        })
    add_on_url = "?"
    add_on = False
    for key, value in flask.request.args.to_dict().items():
        if(key, value):
            add_on = True
        add_on_url += key
        add_on_url += '='
        add_on_url += value
        add_on_url += '&'
    url = (base_url + add_on_url).rstrip('&')
    if not add_on:
        url = base_url
    next_url = ''
    if len(posts) >= size:
        if size * page <= len(posts):
            next_url = next_url + base_url + "?size=" + str(size) + "&page=" + str(page + 1) + "&postid_lte=" + str(max_postid)
        else:
            next_url = next_url + base_url + "?size=" + str(size) + "&page=" + str(page) + "&postid_lte=" + str(max_postid)
    context = {"next": next_url, "results": results, "url": url}
    return flask.jsonify(**context)


@insta485.app.route('/api/v1/posts/<int:postid_url_slug>/', methods = ['GET'])
def get_post(postid_url_slug):
    """Return post on postid."""
    #Hard coded
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT * FROM posts ORDER BY postid DESC LIMIT 1"
    )
    largest_post = cur.fetchone()
    if postid_url_slug > largest_post['postid']:
        context = {"message": "Not Found", "status_code": 404}
        return flask.jsonify(**context), 404
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
    cur = connection.execute(
        "SELECT * FROM posts WHERE postid == ?",
        (postid_url_slug,)
    )
    post = cur.fetchone()

    cur = connection.execute(
        "SELECT * "
        "FROM likes "
        "WHERE postid == ?",
        (postid_url_slug,)
    )
    likes = cur.fetchall()

    cur = connection.execute(
        "SELECT * "
        "FROM comments "
        "WHERE postid == ?",
        (postid_url_slug,)
    )
    comments = cur.fetchall()

    cur = connection.execute(
        "SELECT * "
        "FROM users "
        "WHERE username == ?",
        (username,)
    )
    user = cur.fetchone()
    comm_results = []
    for comment in comments:
        logname_owns = False
        if comment['owner'] == username:
            logname_owns = True
        comm_results.append({
            "commentid": comment["commentid"],
            "lognameOwnsThis": logname_owns,
            "owner": comment['owner'],
            "ownerShowUrl": "/users/" + comment['owner'] + '/',
            "text": comment['text'],
            "url": "/api/v1/comments/" + str(comment["commentid"]) + '/'
        })
    comments_url = "/api/v1/comments/?postid=" + str(postid_url_slug)
    created = ""
    img_url = "/uploads/" + post['filename']
    logname_likes = False
    log_like_id = None
    for like in likes:
        if like['owner'] == username:
            logname_likes = True
            log_like_id = like['likeid']
    if not logname_likes:
        like_url = None
    else:
        like_url = "/api/v1/likes/" + str(log_like_id) + '/'
    like_results = {
        "lognameLikesThis": logname_likes,
        "numLikes": len(likes),
        "url": like_url
    }
    context = {"comments": comm_results,
               "comments_url": comments_url, 
               "created": created,
               "imgUrl": img_url, 
               "likes": like_results,
               "owner": post['owner'],
               "ownerImgUrl": "/uploads/" + user['filename'],
               "ownerShowUrl": "/users/" + username + '/',
               "postShowUrl": f"/posts/{postid_url_slug}/",
               "postid": postid_url_slug,
               "url": flask.request.path}
    return flask.jsonify(**context)