"""Insta485 model (database) API."""
import sqlite3
import flask
import insta485


def dict_factory(cursor, row):
    """Convert database row objects to a dictionary keyed on column name.

    This is useful for building dictionaries which are then used to render a
    template.  Note that this would be inefficient for large queries.
    """
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}


def get_db():
    """Open a new database connection.

    Flask docs:
    https://flask.palletsprojects.com/en/1.0.x/appcontext/#storing-data
    """
    if 'sqlite_db' not in flask.g:
        db_filename = insta485.app.config['DATABASE_FILENAME']
        flask.g.sqlite_db = sqlite3.connect(str(db_filename))
        flask.g.sqlite_db.row_factory = dict_factory

        # Foreign keys have to be enabled per-connection.  This is an sqlite3
        # backwards compatibility thing.
        flask.g.sqlite_db.execute("PRAGMA foreign_keys = ON")

    return flask.g.sqlite_db


@insta485.app.teardown_appcontext
def close_db(error):
    """Close the database at the end of a request.

    Flask docs:
    https://flask.palletsprojects.com/en/1.0.x/appcontext/#storing-data
    """
    assert error or not error  # Needed to avoid superfluous style error
    sqlite_db = flask.g.pop('sqlite_db', None)
    if sqlite_db is not None:
        sqlite_db.commit()
        sqlite_db.close()


# Music Discovery Platform Functions
def get_trending_artists():
    """Get trending artists based on social media growth."""
    connection = get_db()
    cur = connection.execute(
        """
        SELECT 
            artist_id,
            artist_name,
            instagram_handle,
            followers_count,
            growth_rate,
            genre,
            breakout_score
        FROM artists 
        ORDER BY breakout_score DESC 
        LIMIT 10
        """
    )
    return cur.fetchall()


def get_tastemakers():
    """Get users identified as tastemakers based on early adopter behavior."""
    connection = get_db()
    cur = connection.execute(
        """
        SELECT 
            user_id,
            username,
            influence_score,
            early_adopter_score,
            genres_followed
        FROM tastemakers 
        ORDER BY influence_score DESC 
        LIMIT 10
        """
    )
    return cur.fetchall()


def get_trending_genres():
    """Get trending genres based on social media activity."""
    connection = get_db()
    cur = connection.execute(
        """
        SELECT 
            genre,
            growth_rate,
            artist_count,
            trending_score
        FROM genres 
        ORDER BY trending_score DESC 
        LIMIT 8
        """
    )
    return cur.fetchall()


def get_social_media_metrics(artist_id):
    """Get social media metrics for a specific artist."""
    connection = get_db()
    cur = connection.execute(
        """
        SELECT 
            platform,
            followers_count,
            engagement_rate,
            growth_rate,
            last_updated
        FROM social_metrics 
        WHERE artist_id = ?
        """,
        (artist_id,)
    )
    return cur.fetchall()
