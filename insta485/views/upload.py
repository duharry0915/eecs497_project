"""Module for handling file downloads in the Insta485 app."""

import os
import flask
import insta485


@insta485.app.route('/uploads/<filename>')
def download_file(filename):
    """Download a file from the upload directory."""
    if 'username' not in flask.session:
        flask.abort(403)
    if not os.path.exists(insta485.app.config['UPLOAD_FOLDER']/filename):
        flask.abort(404)
    return flask.send_from_directory(insta485.app.config['UPLOAD_FOLDER'],
                                     filename, as_attachment=True)
